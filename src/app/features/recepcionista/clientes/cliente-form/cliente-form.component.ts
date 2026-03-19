import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente, ClienteService } from '../../../../core/services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container animate-fade-in">
      <h3 class="form-title">{{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
      
      <form [formGroup]="clienteForm" (ngSubmit)="onSubmit()" class="form-grid">
        <div class="form-field">
          <label>DNI</label>
          <input type="text" formControlName="dni" placeholder="Ingresa DNI" maxlength="8">
          <span class="error" *ngIf="clienteForm.get('dni')?.touched && clienteForm.get('dni')?.invalid">
            DNI requerido (8 dígitos)
          </span>
        </div>

        <div class="form-field">
          <label>Nombre Completo</label>
          <input type="text" formControlName="nombre" placeholder="Nombre completo">
        </div>

        <div class="form-field">
          <label>Email (Opcional)</label>
          <input type="email" formControlName="email" placeholder="correo@ejemplo.com">
        </div>

        <div class="form-field">
          <label>Teléfono</label>
          <input type="text" formControlName="telefono" placeholder="999888777">
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="clienteForm.invalid || loading">
            {{ loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Registrar') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .form-title { color: #2c3e50; margin-bottom: 1.5rem; font-weight: 600; }
    .form-grid { display: grid; gap: 1rem; }
    .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-field label { font-size: 0.9rem; font-weight: 500; color: #64748b; }
    .form-field input { padding: 0.8rem; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: all 0.2s; }
    .form-field input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); outline: none; }
    .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .btn-primary { background: #3b82f6; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .btn-secondary { background: #f1f5f9; color: #64748b; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 500; }
    .error { font-size: 0.8rem; color: #ef4444; }
  `]
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);

  @Input() cliente?: Cliente;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  clienteForm: FormGroup;
  isEdit = false;
  loading = false;

  constructor() {
    this.clienteForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8,20}$')]],
      nombre: ['', Validators.required],
      email: ['', [Validators.email]],
      telefono: ['', [Validators.pattern('^[0-9+ ]{7,20}$')]]
    });
  }

  ngOnInit(): void {
    if (this.cliente) {
      this.isEdit = true;
      this.clienteForm.patchValue(this.cliente);
    }
  }

  onSubmit(): void {
    try {
      if (this.clienteForm.invalid) {
        console.warn("[RECEPCION][ClienteForm][onSubmit] Formulario inválido");
        return;
      }

      this.loading = true;
      const data = this.clienteForm.value;
      const action = this.isEdit ? 'actualizar' : 'registrar';

      console.log(`[RECEPCION][ClienteForm][onSubmit] Intentando ${action} cliente...`, data);

      const request = this.isEdit && this.cliente?.idCliente
        ? this.clienteService.update(this.cliente.idCliente, data)
        : this.clienteService.create(data);

      request.subscribe({
        next: (res) => {
          console.log(`[RECEPCION][ClienteForm][onSubmit] Éxito al ${action} cliente:`, res);
          this.loading = false;
          this.saved.emit();
        },
        error: (err) => {
          console.error(`[RECEPCION][ClienteForm][onSubmit] Error al ${action} cliente:`, err);
          this.loading = false;
          alert(err.error?.message || `Error al ${action} cliente`);
        }
      });
    } catch (error) {
      console.error("[RECEPCION][ClienteForm][onSubmit] Error crítico:", error);
      this.loading = false;
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
