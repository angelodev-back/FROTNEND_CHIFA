import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicService, RestauranteInfo } from '../../../core/services/public.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private publicService = inject(PublicService);

  info = signal<RestauranteInfo | null>(null);
  especialidades = signal<any[]>([]);

  ngOnInit() {
    console.log("[CLIENTE][Home] Inicializando página de inicio...");
    this.publicService.getRestauranteInfo().subscribe({
      next: (resp) => {
        console.log("[CLIENTE][Home] Información del restaurante cargada:", resp.nombre);
        this.info.set(resp);
      },
      error: (err) => {
        console.error("[CLIENTE][Home] Error al cargar info del restaurante:", err);
      }
    });

    this.publicService.getMenuPublico().subscribe({
      next: (resp) => {
        console.log("[CLIENTE][Home] Especialidades cargadas:", resp.length);
        // Tomamos los primeros 3 productos como especialidades
        this.especialidades.set(resp.slice(0, 3));
      },
      error: (err) => {
        console.error("[CLIENTE][Home] Error al cargar especialidades:", err);
      }
    });
  }

  splitHorario(horario: string | undefined): { label: string, time: string }[] {
    if (!horario) return [];
    // Formato esperado: "Lun-Vie: 12:00-22:00, Sab-Dom: 12:00-23:00"
    return horario.split(',').map(h => {
      const parts = h.split(':');
      return {
        label: parts[0]?.trim() || 'Horario',
        time: parts.slice(1).join(':').trim() || ''
      };
    });
  }
}
