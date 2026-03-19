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

  ngOnInit() {
    console.log("[COCINA][Historial] Inicializando historial de pedidos servidos...");
    this.pedidoService.getActivos().subscribe({
      next: (data) => {
        const hist = data.filter(p => p.estado === 'SERVIDO' || p.estado === 'PAGADO');
        console.log("[COCINA][Historial] Pedidos servidos hoy cargados:", hist.length);
        this.historial.set(hist);
      },
      error: (err) => {
        console.error("[COCINA][Historial] Error al cargar historial:", err);
      }
    });
  }
}
