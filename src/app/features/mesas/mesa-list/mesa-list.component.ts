import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MesaService } from '../../../core/services/mesa.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { MesaDTO } from '../../../core/models/mesa.model';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-mozo-mesa-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mesa-list.component.html',
    styleUrls: ['./mesa-list.component.css']
})
export class MesaListComponent implements OnInit {
    private mesaService = inject(MesaService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);

    // Signals para manejar el estado reactivo
    mesas = signal<MesaDTO[]>([]);
    isLoading = signal<boolean>(true);
    error = signal<string | null>(null);

    // Datos del mozo actual extraídos del JWT
    currentMozoId = signal<number | null>(null);

    ngOnInit(): void {
        this.extractMozoId();
        this.cargarMesas();
    }

    private extractMozoId(): void {
        const userTokens = this.authService.getCurrentUser() as any;
        // Asumiendo que `idUsuario` viene en el token decodificado
        if (userTokens && userTokens.idUsuario) {
            this.currentMozoId.set(userTokens.idUsuario);
        }
    }

    cargarMesas(): void {
        this.isLoading.set(true);
        this.error.set(null);

        this.mesaService.getAll()
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (data) => {
                    this.mesas.set(data);
                },
                error: (err) => {
                    this.error.set('No se pudieron cargar las mesas. Por favor, intenta de nuevo.');
                    this.toastService.error('Error al conectar con el servidor.');
                    console.error('Error cargando mesas: ', err);
                }
            });
    }

    atenderMesa(mesa: MesaDTO): void {
        if (mesa.estado !== 'DISPONIBLE') {
            this.toastService.warning(`La mesa ${mesa.numeroMesa || mesa.numero} no está disponible.`);
            return;
        }

        const id = mesa.idMesa || mesa.id;
        if (!id) return;

        this.isLoading.set(true);
        // Asumimos que el backend vincula al mozo logueado (Spring Security context)
        this.mesaService.atenderMesa(id)
            .pipe(finalize(() => this.isLoading.set(false)))
            .subscribe({
                next: (mesaActualizada) => {
                    this.toastService.success(`Ahora estás atendiendo la mesa ${mesa.numeroMesa || mesa.numero}`);
                    // Refrescamos la lista para mostrar el cambio de estado Local
                    this.cargarMesas();

                    // Navegamos a tomar pedido usando el path de Angular 17+ configurado: /mozo/tomar-pedido/:idMesa
                    this.router.navigate(['/mozo/tomar-pedido', id]);
                },
                error: (err) => {
                    this.toastService.error(err.error?.message || 'Error al intentar asignar la mesa.');
                }
            });
    }

    verPedidoOcupado(mesa: MesaDTO): void {
        // Si la mesa está ocupada y corresponde al mozo logueado, vamos a ver el pedido o tomar productos adicionales
        const mozoAsignadoId = mesa.idMozoAsignado || mesa.idMozoAsignado; // fallback a la prop correcta
        const miId = this.currentMozoId();

        if (mozoAsignadoId === miId || mesa.atendidaPorMi) {
            const id = mesa.idMesa || mesa.id;
            // Navegar a la pantalla de tomar/modificar pedido pasando el ID de la mesa como Route Param
            this.router.navigate(['/mozo/tomar-pedido', id]);
        } else {
            this.toastService.warning(`Esta mesa está siendo atendida por ${mesa.nombreMozoAsignado || 'otro mozo'}`);
        }
    }

    // Utilidad para clases CSS de estados
    getEstadoBadgeClass(estado: string): string {
        switch (estado) {
            case 'DISPONIBLE': return 'badge-disponible';
            case 'OCUPADA': return 'badge-ocupada';
            case 'RESERVADA': return 'badge-reservada';
            case 'MANTENIMIENTO': return 'badge-mantenimiento';
            case 'EN_PAGO': return 'badge-en-pago';
            default: return 'badge-default';
        }
    }
}
