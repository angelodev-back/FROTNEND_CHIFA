import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CajaService } from '../../../core/services/caja.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { CajaResumenDTO } from '../../../core/models/caja.model';
import { PedidoDTO } from '../../../core/models/pedido.model';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { WsService } from '../../../core/services/ws.service';

type VistaActiva = 'RESUMEN' | 'ABRIR' | 'CERRAR' | 'PAGAR';

@Component({
    selector: 'app-caja-turnos',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './turnos.component.html',
    styleUrls: ['./turnos.component.css']
})
export class CajaTurnosComponent implements OnInit, OnDestroy {
    private cajaService = inject(CajaService);
    private pedidoService = inject(PedidoService);
    private toastService = inject(ToastService);
    private wsService = inject(WsService);
    private destroy$ = new Subject<void>();

    // Estado
    resumen = signal<CajaResumenDTO | null>(null);
    pedidosServidos = signal<PedidoDTO[]>([]);
    solicitudesPago = signal<any[]>([]);
    isLoading = signal(true);
    isSubmitting = signal(false);
    vistaActiva = signal<VistaActiva>('RESUMEN');
    cajaAbierta = signal(false);
    errorMsg = signal('');

    // Formulario apertura
    montoIncial = 0;

    // Formulario cierre
    montoRealCierre = 0;

    // Formulario pago
    metodosDisponibles = ['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN'] as const;
    pagoForm = {
        idPedido: 0,
        metodoPago: 'EFECTIVO' as 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN'
    };

    setMetodoPago(m: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN'): void {
        this.pagoForm.metodoPago = m;
    }

    ngOnInit(): void {
        this.cargarEstado();
        this.suscribirSolicitudesPago();
    }

    private suscribirSolicitudesPago(): void {
        // WS solicitudes de caja removidas - flujo centralizado en Mozo
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarEstado(): void {
        this.isLoading.set(true);
        this.errorMsg.set('');

        this.cajaService.getResumen().pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (data: CajaResumenDTO) => {
                this.resumen.set(data);
                this.cajaAbierta.set(data.estado === 'ABIERTA');
                if (this.cajaAbierta()) {
                    this.cargarPedidosServidos();
                }
            },
            error: (err: any) => {
                if (err.status === 404 || err.status === 400) {
                    // No hay caja abierta — estado inicial normal
                    this.cajaAbierta.set(false);
                    this.resumen.set(null);
                } else {
                    this.errorMsg.set('Error al conectar con el servidor.');
                }
            }
        });
    }

    cargarPedidosServidos(): void {
        this.pedidoService.getActivos().pipe(takeUntil(this.destroy$)).subscribe({
            next: (pedidos) => {
                this.pedidosServidos.set(
                    pedidos.filter(p => p.estado === 'SERVIDO' || p.estado === 'LISTO' || p.estado === 'EN_PAGO')
                );
            },
            error: () => { /* silencioso — no crítico */ }
        });
    }

    abrirCaja(): void {
        if (this.montoIncial < 0) {
            this.toastService.error('El monto inicial no puede ser negativo.');
            return;
        }
        this.isSubmitting.set(true);
        this.cajaService.abrirCaja(this.montoIncial).pipe(
            finalize(() => this.isSubmitting.set(false))
        ).subscribe({
            next: () => {
                this.toastService.success('Caja abierta correctamente.');
                this.cargarEstado();
                this.vistaActiva.set('RESUMEN');
            },
            error: (err) => {
                this.toastService.error(err.error?.message || 'Error al abrir la caja.');
            }
        });
    }

    cerrarCaja(): void {
        if (this.montoRealCierre < 0) {
            this.toastService.error('El monto real no puede ser negativo.');
            return;
        }
        if (!confirm('¿Confirmas el cierre de caja? Esta acción no se puede deshacer.')) return;

        this.isSubmitting.set(true);
        this.cajaService.cerrarCaja(this.montoRealCierre).pipe(
            finalize(() => this.isSubmitting.set(false))
        ).subscribe({
            next: (resumen: CajaResumenDTO) => {
                this.toastService.success('Caja cerrada correctamente.');
                this.resumen.set(resumen);
                this.cajaAbierta.set(false);
                this.vistaActiva.set('RESUMEN');
            },
            error: (err: any) => {
                this.toastService.error(err.error?.message || 'Error al cerrar la caja.');
            }
        });
    }

    procesarPago(): void {
        if (!this.pagoForm.idPedido || this.pagoForm.idPedido <= 0) {
            this.toastService.error('Debes seleccionar un pedido para pagar.');
            return;
        }
        this.isSubmitting.set(true);
        this.cajaService.pagarPedido({
            idPedido: this.pagoForm.idPedido,
            metodoPago: this.pagoForm.metodoPago
        }).pipe(
            finalize(() => this.isSubmitting.set(false))
        ).subscribe({
            next: () => {
                this.toastService.success('Pago procesado correctamente.');
                this.pagoForm = { idPedido: 0, metodoPago: 'EFECTIVO' };
                this.cargarEstado();
                this.vistaActiva.set('RESUMEN');
            },
            error: (err: any) => {
                this.toastService.error(err.error?.message || 'Error al procesar el pago.');
            }
        });
    }

    setVista(v: VistaActiva): void {
        this.vistaActiva.set(v);
    }

    seleccionarPedido(id: number): void {
        this.pagoForm.idPedido = id;
    }

    getMetodoBadge(m: string): string {
        const map: Record<string, string> = {
            EFECTIVO: 'badge-efectivo',
            TARJETA: 'badge-tarjeta',
            YAPE: 'badge-yape',
            PLIN: 'badge-yape'
        };
        return map[m] ?? '';
    }

    getDiferencia(): number {
        const r = this.resumen();
        if (!r) return 0;
        return (r.montoRealInformado ?? r.montoCierreCalculado) - r.montoCierreCalculado;
    }
}
