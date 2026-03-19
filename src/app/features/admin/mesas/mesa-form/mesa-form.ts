import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MesaService } from '../../../../core/services/mesa.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MesaDTO } from '../../../../core/models/mesa.model';

@Component({
  selector: 'app-admin-mesa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mesa-form.html',
  styleUrl: './mesa-form.css'
})
export class AdminMesaForm implements OnInit {
  private fb = inject(FormBuilder);
  private mesaService = inject(MesaService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mesaForm!: FormGroup;
  submitting = false;

  @Input() isModal = false;
  @Input() isEditMode = false;
  @Input() mesaId: number | null = null;
  @Input() nextMesaNumero: number | null = null;

  @Output() onSave = new EventEmitter<MesaDTO>();
  @Output() onCancel = new EventEmitter<void>();

  ngOnInit() {
    console.log("[ADMIN][MesaForm] Inicializando componente de formulario de mesa...");
    this.initForm();
    if (this.isModal) {
      if (this.isEditMode && this.mesaId) {
        this.cargarMesa(this.mesaId);
      }
    } else {
      this.checkEditMode();
    }
  }

  private initForm() {
    console.log("[ADMIN][MesaForm][initForm] Configurando validaciones del formulario de mesa...");
    this.mesaForm = this.fb.group({
      numeroMesa: [{value: this.nextMesaNumero || '', disabled: !this.isEditMode}, [Validators.required]],
      capacidad: [4, [Validators.required, Validators.min(1)]],
      estado: ['DISPONIBLE', [Validators.required]]
    });

    if (!this.isModal && !this.isEditMode && !this.nextMesaNumero) {
      this.mesaService.getAll().subscribe({
        next: (mesas) => {
          let max = 0;
          if (mesas.length > 0) {
            max = Math.max(...mesas.map(m => parseInt((m.numeroMesa || m.numero) as any) || 0));
          }
          this.mesaForm.patchValue({ numeroMesa: max + 1 });
        }
      });
    }
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log("[ADMIN][MesaForm][checkEditMode] Modo EDICIÓN detectado para mesa ID:", id);
      this.isEditMode = true;
      this.mesaId = +id;
      this.cargarMesa(this.mesaId);
    } else {
      console.log("[ADMIN][MesaForm][checkEditMode] Modo CREACIÓN detectado");
    }
  }

  private cargarMesa(id: number) {
    console.log(`[ADMIN][MesaForm][cargarMesa] Solicitando datos de la mesa ID ${id}...`);
    this.mesaService.getById(id).subscribe({
      next: (m) => {
        console.log("[ADMIN][MesaForm][cargarMesa] Datos cargados:", m);
        this.mesaForm.patchValue({
          numeroMesa: m.numeroMesa || m.numero,
          capacidad: m.capacidad,
          estado: m.estado
        });
      },
      error: (err) => {
        console.error(`[ADMIN][MesaForm][cargarMesa] Error al cargar mesa ID ${id}:`, err);
        this.toastService.error('Error al cargar mesa');
      }
    });
  }

  showConfirmation = false;
  showSuccessOverlay = false;

  onSubmit() {
    if (this.mesaForm.invalid) return;
    this.showConfirmation = true;
  }

  confirmar() {
    try {
      this.submitting = true;
      this.showConfirmation = false;
      const val = this.mesaForm.getRawValue();
      console.log("[ADMIN][MesaForm][confirmar] Enviando datos:", val);

      if (this.isEditMode && this.mesaId) {
        this.mesaService.update(this.mesaId, val).subscribe({
          next: (res) => {
            this.handleSuccess(res);
          },
          error: (err) => {
            console.error("[ADMIN][MesaForm] Error al actualizar mesa:", err);
            this.toastService.error('Error al actualizar');
            this.submitting = false;
          }
        });
      } else {
        this.mesaService.create(val).subscribe({
          next: (res) => {
            this.handleSuccess(res);
          },
          error: (err) => {
            console.error("[ADMIN][MesaForm] Error al crear mesa:", err);
            this.toastService.error('Error al crear');
            this.submitting = false;
          }
        });
      }
    } catch (error) {
      console.error("[ADMIN][MesaForm] Error crítico:", error);
      this.toastService.error("Error inesperado");
      this.submitting = false;
    }
  }

  cancelarConfirmacion() {
    this.showConfirmation = false;
  }

  private handleSuccess(res: MesaDTO) {
    this.showSuccessOverlay = true;
    this.submitting = false;
    
    // Añadimos un pequeño delay para que el usuario vea el mensaje de éxito
    setTimeout(() => {
      this.showSuccessOverlay = false;
      if (this.isModal) {
        this.onSave.emit(res);
      } else {
        this.router.navigate(['/admin/mesas']);
      }
    }, 1500);
  }
}
