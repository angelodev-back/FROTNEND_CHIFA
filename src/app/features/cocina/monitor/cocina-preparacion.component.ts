import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoDTO } from '../../../core/models/pedido.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-cocina-preparacion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cocina-preparacion.component.html',
  styleUrl: './cocina-preparacion.component.css'
})
export class CocinaPreparacionComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private toastService = inject(ToastService);
  pedidos = signal<PedidoDTO[]>([]);

  ngOnInit() {
    console.log("[COCINA][Preparacion] Inicializando lista de platos en cocina...");
    this.cargar();
  }

  cargar() {
    console.log("[COCINA][Preparacion][cargar] Solicitando pedidos para preparación...");
    this.pedidoService.getPedidosCocina().subscribe({
      next: (data) => {
        const filtered = data.filter(p => p.estado === 'PREPARANDO' || p.estado === 'EN_PREPARACION');
        console.log("[COCINA][Preparacion][cargar] Pedidos en preparación:", filtered.length);
        this.pedidos.set(filtered);
      },
      error: (err) => {
        console.error("[COCINA][Preparacion][cargar] Error al obtener pedidos:", err);
      }
    });
  }

  marcarDet(det: any) {
    try {
      console.log(`[COCINA][Preparacion][marcarDet] Detalle ID ${det.idDetalle} -> LISTO...`);
      this.pedidoService.updateDetalleEstado(det.idDetalle, 'LISTO').subscribe({
        next: () => {
          console.log(`[COCINA][Preparacion][marcarDet] Éxito para detalle ${det.idDetalle}`);
          this.cargar();
        },
        error: (err) => console.error(`[COCINA][Preparacion][marcarDet] Error en detalle ${det.idDetalle}:`, err)
      });
    } catch (error) {
      console.error("[COCINA][Preparacion][marcarDet] Error inesperado:", error);
    }
  }

  marcarTodoListo(p: PedidoDTO) {
    try {
      console.log(`[COCINA][Preparacion][marcarTodoListo] Finalizando pedido ID: ${p.idPedido}...`);
      this.pedidoService.cambiarEstado(p.idPedido!, 'LISTO').subscribe({
        next: () => {
          console.log(`[COCINA][Preparacion][marcarTodoListo] Pedido ID ${p.idPedido} listo`);
          this.toastService.success('Pedido terminado');
          this.cargar();
        },
        error: (err) => {
          console.error(`[COCINA][Preparacion][marcarTodoListo] Error en pedido ID ${p.idPedido}:`, err);
          this.toastService.error("Error al finalizar pedido");
        }
      });
    } catch (error) {
      console.error("[COCINA][Preparacion][marcarTodoListo] Error inesperado:", error);
    }
  }
}
