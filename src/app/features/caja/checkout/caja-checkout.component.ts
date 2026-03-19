import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CajaService } from '../../../core/services/caja.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { PedidoDTO } from '../../../core/models/pedido.model';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-caja-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './caja-checkout.component.html',
    styleUrls: ['./caja-checkout.component.css']
})
export class CajaCheckoutComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private cajaService = inject(CajaService);
    private pedidoService = inject(PedidoService);
    private toastService = inject(ToastService);
    private destroy$ = new Subject<void>();

    pedido = signal<PedidoDTO | null>(null);
    isLoading = signal(true);
    isSubmitting = signal(false);
    errorMsg = signal('');
    metodoPago = signal<'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN'>('EFECTIVO');
    pagoExitoso = signal(false);

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!id) {
            this.errorMsg.set('ID de pedido no válido.');
            this.isLoading.set(false);
            return;
        }
        this.cargarPedido(id);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    cargarPedido(id: number): void {
        this.isLoading.set(true);
        this.pedidoService.getPedidoById(id).pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (p: PedidoDTO) => this.pedido.set(p),
            error: () => this.errorMsg.set('No se encontró el pedido. Verifique el ID.')
        });
    }

    confirmarPago(): void {
        const p = this.pedido();
        if (!p) return;

        if (p.estado !== 'SERVIDO' && p.estado !== 'LISTO' && p.estado !== 'EN_PAGO') {
            this.toastService.error(`Solo se pueden pagar pedidos en estado SERVIDO, LISTO o EN_PAGO. Estado actual: ${p.estado}`);
            return;
        }

        this.isSubmitting.set(true);
        this.cajaService.pagarPedido({
            idPedido: p.idPedido,
            metodoPago: this.metodoPago()
        }).pipe(
            finalize(() => this.isSubmitting.set(false))
        ).subscribe({
            next: () => {
                this.pagoExitoso.set(true);
                this.toastService.success('¡Pago registrado correctamente!');
            },
            error: (err: any) => {
                this.toastService.error(err.error?.message || 'Error al procesar el pago. ¿Tienes una caja abierta?');
            }
        });
    }

    volver(): void {
        this.router.navigate(['/caja']);
    }

    getEstadoBadge(estado: string): string {
        const map: Record<string, string> = {
            PENDIENTE: 'badge-pendiente', PREPARANDO: 'badge-preparando',
            LISTO: 'badge-listo', SERVIDO: 'badge-servido',
            EN_PAGO: 'badge-en_pago',
            PAGADO: 'badge-pagado', CANCELADO: 'badge-cancelado'
        };
        return map[estado] ?? '';
    }

    getMetodosDisponibles(): ReadonlyArray<'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN'> {
        return ['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN'] as const;
    }

    setMetodo(m: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN'): void {
        this.metodoPago.set(m);
    }
}
