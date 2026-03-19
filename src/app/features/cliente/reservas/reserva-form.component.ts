import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ReservaService, ReservaDTO } from '../../../core/services/reserva.service';
import { MesaService } from '../../../core/services/mesa.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reserva-form.component.html',
  styleUrl: './reserva-form.component.css'
})
export class ReservaFormComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private mesaService = inject(MesaService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  horarios = ['12:00:00', '13:00:00', '14:00:00', '19:00:00', '20:00:00', '21:00:00'];
  mesas: any[] = [];
  
  model = {
    fecha: '',
    hora: '',
    cantidadPersonas: 2,
    idMesa: null as number | null,
    observaciones: ''
  };

  ngOnInit() {
    console.log("[CLIENTE][ReservaForm] Inicializando formulario de reserva...");
    this.mesaService.getAll().subscribe({
      next: (m) => {
        const disponibles = m.filter(x => x.estado === 'DISPONIBLE');
        console.log("[CLIENTE][ReservaForm] Mesas disponibles cargadas:", disponibles.length);
        this.mesas = disponibles;
      },
      error: (err) => {
        console.error("[CLIENTE][ReservaForm] Error al cargar mesas:", err);
      }
    });
  }

  confirmar() {
    try {
      const dto: Partial<ReservaDTO> = {
        fechaHoraReserva: `${this.model.fecha}T${this.model.hora}`,
        cantidadPersonas: this.model.cantidadPersonas,
        idMesa: this.model.idMesa || undefined,
        observaciones: this.model.observaciones,
        estado: 'PENDIENTE'
      };

      console.log("[CLIENTE][ReservaForm][confirmar] Intentando registrar solicitud...", dto);

      this.reservaService.crearReserva(dto).subscribe({
        next: (res) => {
          console.log("[CLIENTE][ReservaForm][confirmar] Reserva solicitada con éxito:", res);
          this.toastService.success('Reserva solicitada correctamente');
          this.router.navigate(['/cliente/mis-reservas']);
        },
        error: (err) => {
          console.error("[CLIENTE][ReservaForm][confirmar] Error al solicitar:", err);
          this.toastService.error('Error al solicitar reserva');
        }
      });
    } catch (error) {
      console.error("[CLIENTE][ReservaForm][confirmar] Error inesperado:", error);
    }
  }
}
