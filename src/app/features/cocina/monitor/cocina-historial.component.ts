import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { PedidoDTO } from '../../../core/models/pedido.model';

@Component({
  selector: 'app-cocina-historial',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cocina-historial.component.html',
  styleUrl: './cocina-historial.component.css'
})
export class CocinaHistorialComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  historial = signal<PedidoDTO[]>([]);
  selectedPedido = signal<PedidoDTO | null>(null);

  ngOnInit() {
    console.log("[COCINA][Historial] Inicializando historial de pedidos servidos...");
    this.refreshHistorial();
  }

  refreshHistorial() {
    this.pedidoService.getHistorialCocina().subscribe({
      next: (data) => {
        console.log("[COCINA][Historial] Historial cargado:", data.length);
        this.historial.set(data);
      },
      error: (err) => {
        console.error("[COCINA][Historial] Error al cargar historial:", err);
      }
    });
  }

  verDetalle(p: PedidoDTO) {
    console.log("[COCINA][Historial] Ver detalle de pedido:", p.idPedido);
    this.selectedPedido.set(p);
  }

  cerrarDetalle() {
    console.log("[COCINA][Historial] Cerrando detalle");
    this.selectedPedido.set(null);
  }
}
