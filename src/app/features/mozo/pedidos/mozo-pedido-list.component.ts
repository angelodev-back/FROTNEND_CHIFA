import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MozoPedidoService } from '../../../core/services/mozo-pedido.service';
import { PedidoDTO } from '../../../core/models/pedido.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-mozo-pedido-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mozo-pedido-list.component.html',
  styleUrl: './mozo-pedido-list.component.css'
})
export class MozoPedidoListComponent implements OnInit {
  private pedidoService = inject(MozoPedidoService);
  private toastService = inject(ToastService);

  pedidos = signal<PedidoDTO[]>([]);
  filtro = 'PREPARANDO';

  ngOnInit() {
    console.log("[MOZO][PedidoList] Inicializando listado de pedidos del mozo...");
    this.cargarPedidos();
  }

  setFiltro(f: string) {
    console.log(`[MOZO][PedidoList][setFiltro] Cambiando filtro a: ${f}`);
    this.filtro = f;
    this.cargarPedidos();
  }

  cargarPedidos() {
    console.log(`[MOZO][PedidoList][cargarPedidos] Cargando pedidos con filtro: ${this.filtro}...`);
    this.pedidoService.getMisPedidos(this.filtro).subscribe({
      next: (res) => {
        console.log(`[MOZO][PedidoList][cargarPedidos] ${res.length} pedidos cargados para filtro: ${this.filtro}`);
        this.pedidos.set(res);
      },
      error: (err) => {
        console.error(`[MOZO][PedidoList][cargarPedidos] Error al cargar pedidos (${this.filtro}):`, err);
        this.toastService.error("No se pudieron cargar tus pedidos");
      }
    });
  }

  servir(id: number) {
    try {
      console.log(`[MOZO][PedidoList][servir] Intentando marcar como SERVIDO el pedido ID: ${id}...`);
      this.pedidoService.marcarComoServido(id).subscribe({
        next: () => {
          console.log(`[MOZO][PedidoList][servir] Pedido ID ${id} servido con éxito`);
          this.toastService.success('El pedido ha sido marcado como servido');
          this.cargarPedidos();
        },
        error: (err) => {
          console.error(`[MOZO][PedidoList][servir] Error al servir pedido ID ${id}:`, err);
          this.toastService.error('Ocurrió un error al servir el pedido');
        }
      });
    } catch (error) {
      console.error("[MOZO][PedidoList][servir] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado");
    }
  }
}
