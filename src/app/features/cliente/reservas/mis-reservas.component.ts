import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservaService, ReservaDTO } from '../../../core/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mis-reservas.component.html',
  styleUrl: './mis-reservas.component.css'
})
export class MisReservasComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private toastService = inject(ToastService);

  reservas = signal<ReservaDTO[]>([]);
  months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];

  ngOnInit() {
    console.log("[CLIENTE][MisReservas] Inicializando historial de reservas...");
    this.cargarReservas();
  }

  cargarReservas() {
    console.log("[CLIENTE][MisReservas][cargarReservas] Solicitando mis reservas...");
    this.reservaService.listarMisReservas().subscribe({
      next: (rs) => {
        console.log("[CLIENTE][MisReservas][cargarReservas] Historial cargado:", rs.length);
        this.reservas.set(rs);
      },
      error: (err) => {
        console.error("[CLIENTE][MisReservas][cargarReservas] Error al cargar historial:", err);
      }
    });
  }

  getDay(dateStr: string | undefined) {
    if (!dateStr) return '--';
    try {
      return new Date(dateStr).getDate();
    } catch { return '??'; }
  }

  getMonthName(dateStr: string | undefined) {
    if (!dateStr) return '---';
    try {
      return this.months[new Date(dateStr).getMonth()];
    } catch { return '---'; }
  }

  getTime(dateStr: string | undefined) {
    if (!dateStr) return '--:--';
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return '--:--'; }
  }

  cancelar(id: number) {
    try {
      if (confirm('¿Estás seguro de cancelar esta reserva?')) {
        console.log(`[CLIENTE][MisReservas][cancelar] Intentando cancelar ID: ${id}...`);
        this.reservaService.cancelar(id).subscribe({
          next: () => {
            console.log(`[CLIENTE][MisReservas][cancelar] Reserva ID ${id} cancelada`);
            this.toastService.success('Reserva cancelada');
            this.cargarReservas();
          },
          error: (err) => {
            console.error(`[CLIENTE][MisReservas][cancelar] Error al cancelar ID ${id}:`, err);
            this.toastService.error('No se pudo cancelar la reserva');
          }
        });
      }
    } catch (error) {
      console.error("[CLIENTE][MisReservas][cancelar] Error inesperado:", error);
    }
  }
}
