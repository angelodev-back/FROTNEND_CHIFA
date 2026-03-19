import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoDTO } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-cocina-listos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cocina-listos.component.html',
  styleUrl: './cocina-listos.component.css'
})
export class CocinaListosComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  pedidos = signal<PedidoDTO[]>([]);

  ngOnInit() {
    console.log("[COCINA][Listos] Inicializando monitor de platos listos...");
    this.cargar();
  }

  cargar() {
    console.log("[COCINA][Listos][cargar] Solicitando pedidos listos...");
    this.pedidoService.getPedidosCocina().subscribe({
      next: (data) => {
        const listos = data.filter(p => p.estado === 'LISTO');
        console.log("[COCINA][Listos][cargar] Pedidos listos cargados:", listos.length);
        this.pedidos.set(listos);
      },
      error: (err) => {
        console.error("[COCINA][Listos][cargar] Error al cargar pedidos listos:", err);
      }
    });
  }

  marcarEntregado(p: PedidoDTO) {
    try {
      console.log(`[COCINA][Listos][marcarEntregado] Marcando pedido ID ${p.idPedido} como SERVIDO...`);
      this.pedidoService.cambiarEstado(p.idPedido!, 'SERVIDO').subscribe({
        next: () => {
          console.log(`[COCINA][Listos][marcarEntregado] Pedido ID ${p.idPedido} entregado`);
          this.cargar();
        },
        error: (err) => console.error(`[COCINA][Listos][marcarEntregado] Error en pedido ID ${p.idPedido}:`, err)
      });
    } catch (error) {
      console.error("[COCINA][Listos][marcarEntregado] Error inesperado:", error);
    }
  }
}
