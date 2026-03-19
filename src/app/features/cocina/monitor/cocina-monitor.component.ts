import {
    Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PedidoService } from '../../../core/services/pedido.service';
import { WsService } from '../../../core/services/ws.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { PedidoDTO, DetallePedidoDTO } from '../../../core/models/pedido.model';

/**
 * Monitor de cocina — versión para la ruta /cocina/monitor/.
 * NO incluye SidebarComponent propio (AdminLayout ya lo provee).
 */
@Component({
    selector: 'app-cocina-monitor',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cocina-monitor.component.html',
    styleUrl: './cocina-monitor.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DatePipe]
})
export class CocinaMonitorComponent implements OnInit, OnDestroy {
    private pedidoService = inject(PedidoService);
    private wsService = inject(WsService);
    private toastService = inject(ToastService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    pedidos: PedidoDTO[] = [];
    loading = true;
    error = '';
    tiempoActual = new Date();

    ngOnInit(): void {
        console.log("[COCINA][Monitor-Legacy] Inicializando monitor secundario...");
        this.cargarPedidos();
        this.initRealTime();

        // Reloj en tiempo real
        interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.tiempoActual = new Date();
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        console.log("[COCINA][Monitor-Legacy] Destruyendo componente...");
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarPedidos(): void {
        console.log("[COCINA][Monitor-Legacy][cargarPedidos] Recargando lista de pedidos...");
        this.loading = true;
        this.pedidoService.getPedidosCocina().subscribe({
            next: (data) => {
                console.log("[COCINA][Monitor-Legacy][cargarPedidos] Pedidos recibidos:", data.length);
                this.pedidos = data;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error("[COCINA][Monitor-Legacy][cargarPedidos] Error al conectar con servidor:", err);
                this.error = 'Error conectando con el servidor de cocina';
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    initRealTime(): void {
        try {
            console.log("[COCINA][Monitor-Legacy][initRealTime] Abriendo conexión WS...");
            this.wsService.connect();

            this.wsService.subscribe('/topic/cocina/nuevo-pedido')
                .pipe(debounceTime(500), takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log("[COCINA][Monitor-Legacy][WS] Alerta de nuevo pedido");
                        this.cargarPedidos();
                    },
                    error: (err) => console.error("[COCINA][Monitor-Legacy][WS] Error en sub nuevo-pedido:", err)
                });

            this.wsService.subscribe('/topic/pedidos/estado')
                .pipe(debounceTime(500), takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log("[COCINA][Monitor-Legacy][WS] Alerta de cambio de estado");
                        this.cargarPedidos();
                    },
                    error: (err) => console.error("[COCINA][Monitor-Legacy][WS] Error en sub estado:", err)
                });
        } catch (wsError) {
            console.error("[COCINA][Monitor-Legacy][initRealTime] Error crítico WS:", wsError);
        }
    }

    actualizarEstado(pedidoId: number, detalle: DetallePedidoDTO, nuevoEstado: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO'): void {
        try {
            console.log(`[COCINA][Monitor-Legacy][actualizarEstado] Detalle ID ${detalle.idDetalle} -> ${nuevoEstado}`);
            const prev = detalle.estadoCocina;
            detalle.estadoCocina = nuevoEstado;
            this.cdr.markForCheck();

            this.pedidoService.updateDetalleEstado(detalle.idDetalle, nuevoEstado).subscribe({
                next: () => {
                    console.log(`[COCINA][Monitor-Legacy][actualizarEstado] Éxito para detalle ${detalle.idDetalle}`);
                    this.toastService.success(`Estado: ${nuevoEstado}`);
                },
                error: (err) => {
                    console.error(`[COCINA][Monitor-Legacy][actualizarEstado] Error para detalle ${detalle.idDetalle}:`, err);
                    detalle.estadoCocina = prev;
                    this.cdr.markForCheck();
                    this.toastService.error('Error al actualizar estado');
                }
            });
        } catch (error) {
            console.error("[COCINA][Monitor-Legacy][actualizarEstado] Error inesperado:", error);
        }
    }

    getPendientesCount(): number {
        return this.pedidos.filter(p => p.detalles.some(d => d.estadoCocina === 'PENDIENTE')).length;
    }

    getPreparandoCount(): number {
        return this.pedidos.filter(p => p.detalles.some(d => d.estadoCocina === 'EN_PREPARACION')).length;
    }
}
