import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReservaService, ReservaDTO } from '../../../core/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-recepcion-reserva-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recepcion-reserva-detail.component.html',
  styleUrl: './recepcion-reserva-detail.component.css'
})
export class RecepcionReservaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reservaService = inject(ReservaService);
  private toastService = inject(ToastService);

  reserva = signal<ReservaDTO | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargar(+id);
    }
  }

  cargar(id: number) {
    this.isLoading.set(true);
    this.reservaService.getById(id).subscribe({
      next: (res: ReservaDTO) => {
        this.reserva.set(res);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("[RECEPCION][Detail] Error al cargar:", err);
        this.toastService.error("No se pudo cargar el detalle");
        this.isLoading.set(false);
      }
    });
  }
}
