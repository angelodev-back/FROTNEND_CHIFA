import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReservaService, ReservaDTO } from '../../../../core/services/reserva.service';
import { MesaService } from '../../../../core/services/mesa.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MesaDTO } from '../../../../core/models/mesa.model';

@Component({
  selector: 'app-admin-reserva-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reserva-form.html',
  styleUrl: './reserva-form.css'
})
export class AdminReservaForm implements OnInit {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private mesaService = inject(MesaService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @Input() id: number | null = null;
  @Input() isModal = false;
  @Output() onSave = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  reservaForm!: FormGroup;
  mesas: MesaDTO[] = [];
  submitting = false;
  isEditMode = false;
  reservaId: number | null = null;

  ngOnInit() {
    console.log("[ADMIN][ReservaForm] Inicializando componente de formulario de reserva...");
    this.initForm();
    this.cargarMesas();

    if (this.isModal) {
      if (this.id) {
        this.isEditMode = true;
        this.reservaId = this.id;
        this.cargarReserva(this.reservaId);
      }
    } else {
      this.checkEditMode();
    }
  }

  private initForm() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const dateStr = now.toISOString().slice(0, 16);

    this.reservaForm = this.fb.group({
      nombreCliente: ['', [Validators.required]],
      telefonoCliente: ['', [Validators.required]],
      dniCliente: [''],
      cantidadPersonas: [2, [Validators.required, Validators.min(1)]],
      fechaHoraReserva: [dateStr, [Validators.required]],
      idMesa: [null],
      observaciones: [''],
      estado: ['PENDIENTE']
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.reservaId = +id;
      this.cargarReserva(this.reservaId);
    }
  }

  private cargarReserva(id: number) {
    this.reservaService.getById(id).subscribe({
      next: (r) => {
        if (r.fechaHoraReserva) {
          r.fechaHoraReserva = r.fechaHoraReserva.slice(0, 16);
        }
        this.reservaForm.patchValue(r);
      },
      error: (err) => {
        console.error(`Error al cargar reserva ID ${id}:`, err);
        this.toastService.error('Error al cargar reserva');
      }
    });
  }

  private cargarMesas() {
    this.mesaService.getAll().subscribe({
      next: (data) => {
        this.mesas = data;
      },
      error: (err) => {
        console.error("Error al cargar mesas:", err);
      }
    });
  }

  onSubmit() {
    try {
      if (this.reservaForm.invalid) return;
      this.submitting = true;
      const val = this.reservaForm.value;

      const obs = this.isEditMode && this.reservaId
        ? this.reservaService.actualizarReserva(this.reservaId, val)
        : this.reservaService.crearReserva(val);

      obs.subscribe({
        next: () => {
          this.toastService.success(this.isEditMode ? 'Reserva actualizada' : 'Reserva creada');
          if (this.isModal) {
            this.onSave.emit();
          } else {
            this.router.navigate(['/admin/reservas']);
          }
        },
        error: (err) => {
          console.error("Error en la operación:", err);
          this.toastService.error(err.error?.message || 'Error en la operación');
          this.submitting = false;
        }
      });
    } catch (error) {
      console.error("Error crítico inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado");
      this.submitting = false;
    }
  }
}
