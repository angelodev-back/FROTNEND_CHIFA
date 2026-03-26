import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoDTO } from '../../../core/models/pedido.model';
import { WsService } from '../../../core/services/ws.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-recepcion-pagos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './recepcion-pagos.component.html',
  styleUrl: './recepcion-pagos.component.css'
})
export class RecepcionPagosComponent implements OnInit, OnDestroy {
  private pedidoService = inject(PedidoService);
  private wsService = inject(WsService);
  private toastService = inject(ToastService);

  pedidos = signal<PedidoDTO[]>([]);
  loading = signal(false);
  
  // Modal State
  selectedPedido = signal<PedidoDTO | null>(null);
  metodoPago = signal('EFECTIVO');
  procesando = signal(false);

  private subs = new Subscription();

  ngOnInit(): void {
    this.cargarPedidos();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  cargarPedidos(): void {
    this.loading.set(true);
    this.pedidoService.getPedidosEnPago().subscribe({
      next: (data) => {
        this.pedidos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar pedidos en pago:", err);
        this.loading.set(false);
      }
    });
  }

  setupWebSocket(): void {
    // Escuchar cambios de estado globales
    this.subs.add(
      this.wsService.subscribe('/topic/pedidos/status').subscribe(() => {
        this.cargarPedidos();
      })
    );
  }

  abrirConfirmacion(pedido: PedidoDTO): void {
    this.selectedPedido.set(pedido);
    this.metodoPago.set('EFECTIVO');
    this.procesando.set(false);
  }

  cerrarModal(): void {
    this.selectedPedido.set(null);
  }

  confirmarPago(): void {
    const pedido = this.selectedPedido();
    if (!pedido) return;

    this.procesando.set(true);
    this.pedidoService.confirmarPago(pedido.idPedido, this.metodoPago()).subscribe({
      next: () => {
        // El websocket cargará la lista de nuevo, pero adelantamos para fluidez
        this.pedidos.update(list => list.filter(p => p.idPedido !== pedido.idPedido));
        this.toastService.success(`Pago del pedido #${pedido.idPedido} confirmado con éxito`);
        this.cerrarModal();
        this.procesando.set(false);
      },
      error: (err) => {
        console.error("Error al confirmar pago:", err);
        alert("Error al confirmar pago: " + (err.error?.message || 'Error desconocido'));
        this.procesando.set(false);
      }
    });
  }
}
