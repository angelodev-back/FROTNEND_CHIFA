import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { PedidoDTO } from '../../../core/models/pedido.model';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
    selector: 'app-comprobante-view',
    standalone: true,
    imports: [CommonModule],
    providers: [DatePipe],
    templateUrl: './comprobante-view.component.html',
    styleUrls: ['./comprobante-view.component.css']
})
export class ComprobanteViewComponent implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private pedidoService = inject(PedidoService);
    private toastService = inject(ToastService);
    private destroy$ = new Subject<void>();

    pedido = signal<PedidoDTO | null>(null);
    isLoading = signal(true);
    errorMsg = signal('');
    fechaImpresion = new Date();

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!id) {
            this.errorMsg.set('ID no válido.');
            this.isLoading.set(false);
            return;
        }
        this.pedidoService.getPedidoById(id).pipe(
            takeUntil(this.destroy$),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (p) => this.pedido.set(p),
            error: () => this.errorMsg.set('No se pudo cargar el comprobante.')
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    imprimir(): void {
        window.print();
    }

    volver(): void {
        this.router.navigate(['/caja']);
    }
}
