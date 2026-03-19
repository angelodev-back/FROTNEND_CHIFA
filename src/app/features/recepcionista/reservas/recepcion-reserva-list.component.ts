import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReservaService, ReservaDTO } from '../../../core/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-recepcion-reserva-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, KpiCardComponent],
  templateUrl: './recepcion-reserva-list.component.html',
  styleUrl: './recepcion-reserva-list.component.css'
})

export class RecepcionReservaListComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private toastService = inject(ToastService);
  reservas = signal<ReservaDTO[]>([]);
  
  stats = computed(() => {
    const list = this.reservas();
    return {
      total: list.length,
      confirmadas: list.filter(r => r.estado === 'CONFIRMADA' || r.estado === 'COMPLETADA').length,
      pendientes: list.filter(r => r.estado === 'PENDIENTE').length,
      canceladas: list.filter(r => r.estado === 'CANCELADA').length
    };
  });

  ngOnInit() {
    console.log("[RECEPCION][ReservaList] Inicializando listado de reservas...");
    this.cargar();
  }

  cargar() {
    console.log("[RECEPCION][ReservaList][cargar] Solicitando todas las reservas...");
    this.reservaService.listarTodas().subscribe({
      next: (res: ReservaDTO[]) => {
        console.log("[RECEPCION][ReservaList][cargar] Reservas cargadas:", res.length);
        this.reservas.set(res);
      },
      error: (err: any) => {
        console.error("[RECEPCION][ReservaList][cargar] Error al cargar reservas:", err);
        this.toastService.error("No se pudieron cargar las reservas");
      }
    });
  }

  confirmar(id: number) {
    console.log(`[RECEPCION][ReservaList][confirmar] Confirmando reserva ID: ${id}...`);
    this.reservaService.confirmar(id).subscribe({
      next: () => {
        this.toastService.success('Reserva confirmada exitosamente');
        this.cargar();
      },
      error: (err: any) => {
        console.error(`[RECEPCION][ReservaList][confirmar] Error:`, err);
        this.toastService.error("No se pudo confirmar la reserva");
      }
    });
  }

  cancelar(id: number) {
    try {
      console.log(`[RECEPCION][ReservaList][cancelar] Intentando cancelar reserva ID: ${id}...`);
      this.reservaService.cancelar(id).subscribe({
        next: () => {
          console.log(`[RECEPCION][ReservaList][cancelar] Reserva ID ${id} cancelada con éxito`);
          this.toastService.info('Reserva cancelada');
          this.cargar();
        },
        error: (err: any) => {
          console.error(`[RECEPCION][ReservaList][cancelar] Error al cancelar reserva ID ${id}:`, err);
          this.toastService.error("Error al cancelar reserva");
        }
      });
    } catch (error) {
      console.error("[RECEPCION][ReservaList][cancelar] Error inesperado:", error);
    }
  }

  completar(id: number) {
    try {
      console.log(`[RECEPCION][ReservaList][completar] Marcando como COMPLETADA reserva ID: ${id}...`);
      this.reservaService.cambiarEstado(id, 'COMPLETADA').subscribe({
        next: () => {
          console.log(`[RECEPCION][ReservaList][completar] Reserva ID ${id} completada exitosamente`);
          this.toastService.success('Cliente en mesa, reserva completada');
          this.cargar();
        },
        error: (err: any) => {
          console.error(`[RECEPCION][ReservaList][completar] Error al completar reserva ID ${id}:`, err);
          this.toastService.error("Error al registrar llegada");
        }
      });
    } catch (error) {
      console.error("[RECEPCION][ReservaList][completar] Error inesperado:", error);
    }
  }
}
