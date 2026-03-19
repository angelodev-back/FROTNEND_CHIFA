import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReservaService } from '../../../core/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-client-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-reserva.component.html',
  styleUrl: './client-reserva.component.css'
})
export class ClientReservaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private toastService = inject(ToastService);

  reservaForm: FormGroup;
  misReservas = signal<any[]>([]);
  loading = signal(false);
  loadingHistory = signal(false);
  personas = 2;
  today = new Date().toISOString().split('T')[0];

  constructor() {
    this.reservaForm = this.fb.group({
      fechaReserva: ['', Validators.required],
      horaReserva: ['', Validators.required],
      comentario: ['']
    });
  }

  ngOnInit() {
    this.loadHistory();
  }

  changePersonas(delta: number) {
    this.personas = Math.min(20, Math.max(1, this.personas + delta));
  }

  loadHistory() {
    this.loadingHistory.set(true);
    this.reservaService.listarMisReservas().subscribe({
      next: (data: any) => {
        this.misReservas.set(data);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false)
    });
  }

  onSubmit() {
    if (this.reservaForm.valid) {
      this.loading.set(true);
      const raw = this.reservaForm.value;
      const data = {
        fechaHoraReserva: `${raw.fechaReserva}T${raw.horaReserva}:00`,
        cantidadPersonas: this.personas,
        observaciones: raw.comentario
      };
      this.reservaService.crearReserva(data).subscribe({
        next: () => {
          this.toastService.success('¡Reserva solicitada con éxito!');
          this.reservaForm.reset();
          this.personas = 2;
          this.loadHistory();
          this.loading.set(false);
        },
        error: () => {
          this.toastService.error('Error al solicitar reserva. Intenta nuevamente.');
          this.loading.set(false);
        }
      });
    }
  }

  cancelar(id: number) {
    if (confirm('¿Deseas cancelar esta reserva?')) {
      this.reservaService.cambiarEstado(id, 'CANCELADA').subscribe({
        next: () => {
          this.toastService.info('Reserva cancelada');
          this.loadHistory();
        }
      });
    }
  }

  getStatusLabel(estado: string): string {
    const labels: Record<string, string> = {
      'PENDIENTE': '⏳ Pendiente', 'CONFIRMADA': '✅ Confirmada',
      'COMPLETADA': '🎉 Completada', 'CANCELADA': '❌ Cancelada'
    };
    return labels[estado] || estado;
  }
}
