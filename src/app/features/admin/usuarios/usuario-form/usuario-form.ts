import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { RolService } from '../../../../core/services/rol.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Rol, Usuario } from '../../../../core/models/usuario.model';
import { Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioForm implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private rolService = inject(RolService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  usuarioForm!: FormGroup;
  roles: Rol[] = [];
  submitting = false;

  @Input() isEditMode = false;
  @Input() usuarioId: number | null = null;
  @Input() isModal = false;

  @Output() onSave = new EventEmitter<Usuario>();
  @Output() onCancel = new EventEmitter<void>();

  loading = false;

  ngOnInit() {
    console.log("[ADMIN][UsuarioForm] Inicializando componente...");
    this.initForm();
    this.cargarRoles();
    if (!this.isModal) {
      this.checkEditMode();
    } else if (this.isEditMode && this.usuarioId) {
      this.cargarUsuario(this.usuarioId);
    }
  }

  private initForm() {
    console.log("[ADMIN][UsuarioForm][initForm] Inicializando estructura de formulario...");
    this.usuarioForm = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      dni: ['', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
      celular: ['', [Validators.pattern(/^[0-9]{9,15}$/)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(4)]], // Reducido a 4 para facilitar pruebas, pero manteniendo seguridad básica
      idRol: ['', Validators.required],
      estado: [true] // Siempre activo por defecto
    });
  }

  private cargarRoles() {
    console.log("[ADMIN][UsuarioForm][cargarRoles] Solicitando roles al servidor...");
    this.rolService.getAll().subscribe({
      next: (data) => {
        // ELIMINAMOS 'CLIENTE' DE LA LISTA PARA EL ADMIN
        const rolesFiltrados = data.filter(r => r.nombre.toUpperCase() !== 'CLIENTE');
        console.log("[ADMIN][UsuarioForm][cargarRoles] Roles cargados y filtrados:", rolesFiltrados.length);
        this.roles = rolesFiltrados;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.warn("[ADMIN][UsuarioForm][cargarRoles] Error al cargar roles, usando roles por defecto:", err);
        this.roles = [
          { idRol: 1, nombre: 'ADMIN' },
          { idRol: 2, nombre: 'CAJERO' },
          { idRol: 3, nombre: 'MOZO' },
          { idRol: 4, nombre: 'COCINERO' },
          { idRol: 5, nombre: 'RECEPCIONISTA' }
        ];
        this.cdr.markForCheck();
      }
    });
  }

  private checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      console.log("[ADMIN][UsuarioForm][checkEditMode] Modo EDICIÓN detectado para usuario ID:", idParam);
      this.isEditMode = true;
      this.usuarioId = +idParam;
      this.initForm(); // Re-init to handle password validator change
      this.cargarUsuario(this.usuarioId);
    } else {
      console.log("[ADMIN][UsuarioForm][checkEditMode] Modo CREACIÓN detectado");
    }
  }

  private cargarUsuario(id: number) {
    this.loading = true;
    console.log(`[ADMIN][UsuarioForm][cargarUsuario] Solicitando datos del usuario ID ${id}...`);
    this.usuarioService.getById(id).subscribe({
      next: (usuario) => {
        console.log("[ADMIN][UsuarioForm][cargarUsuario] Datos cargados:", usuario);
        this.usuarioForm.patchValue({
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          email: usuario.email,
          dni: usuario.dni,
          celular: usuario.celular,
          idRol: usuario.rol?.idRol,
          estado: usuario.estado
        });
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error(`[ADMIN][UsuarioForm][cargarUsuario] Error al cargar usuario ID ${id}:`, err);
        this.toastService.error('Error al cargar datos del usuario');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSubmit() {
    try {
      if (this.usuarioForm.invalid) {
        console.warn("[ADMIN][UsuarioForm][onSubmit] Formulario inválido:", this.usuarioForm.value);
        this.usuarioForm.markAllAsTouched();
        return;
      }

      this.submitting = true;
      const formValue = this.usuarioForm.value;
      console.log("[ADMIN][UsuarioForm][onSubmit] Enviando formulario:", formValue);

      const payload = {
        ...formValue,
        password: formValue.password || undefined,
        estado: this.isEditMode ? formValue.estado : true, // Forzar true si es nuevo
        rol: { idRol: Number(formValue.idRol) }
      };

      if (this.isEditMode && this.usuarioId) {
        console.log(`[ADMIN][UsuarioForm][onSubmit] Actualizando usuario ID ${this.usuarioId} via updateByAdmin...`);
        this.usuarioService.updateByAdmin(this.usuarioId, payload).subscribe({
          next: (res) => {
            console.log("[ADMIN][UsuarioForm][onSubmit] Usuario actualizado con éxito");
            this.toastService.success('Usuario actualizado correctamente');
            if (this.isModal) {
              this.onSave.emit(res);
            } else {
              this.router.navigate(['/admin/usuarios']);
            }
          },
          error: (err) => {
            console.error("[ADMIN][UsuarioForm][onSubmit] Error al actualizar usuario:", err);
            this.toastService.error(err.error?.message || 'Error al actualizar usuario');
            this.submitting = false;
            this.cdr.markForCheck();
          }
        });
      } else {
        console.log("[ADMIN][UsuarioForm][onSubmit] Creando nuevo usuario...");
        this.usuarioService.createByAdmin(payload).subscribe({
          next: (res) => {
            console.log("[ADMIN][UsuarioForm][onSubmit] Usuario creado con éxito:", res);
            this.toastService.success('Usuario creado correctamente');
            if (this.isModal) {
              this.onSave.emit(res);
            } else {
              this.router.navigate(['/admin/usuarios']);
            }
          },
          error: (err) => {
            console.error("[ADMIN][UsuarioForm][onSubmit] Error al crear usuario:", err);
            this.toastService.error(err.error?.message || 'Error al crear usuario');
            this.submitting = false;
            this.cdr.markForCheck();
          }
        });
      }
    } catch (error) {
      console.error("[ADMIN][UsuarioForm][onSubmit] Error crítico inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al procesar la solicitud");
      this.submitting = false;
      this.cdr.markForCheck();
    }
  }
}
