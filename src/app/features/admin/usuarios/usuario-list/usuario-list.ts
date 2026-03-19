import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { UsuarioForm } from '../usuario-form/usuario-form';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, UsuarioForm, EmptyStateComponent],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.css'
})
export class UsuarioList implements OnInit {
  private usuarioService = inject(UsuarioService);
  private toastService = inject(ToastService);

  searchTerm = signal('');
  filtroRol = signal('');
  usuarios = signal<Usuario[]>([]);

  // Modal State
  showModal = signal(false);
  isEditMode = signal(false);
  selectedUserId = signal<number | null>(null);

  // Pagination State
  pageSize = signal(10);
  currentPage = signal(1);
  Math = Math;

  ngOnInit() {
    console.log("[ADMIN][UsuarioList] Inicializando componente...");
    this.cargar();
  }

  cargar() {
    console.log("[ADMIN][UsuarioList][cargar] Solicitando carga de usuarios...");
    this.usuarioService.getAll().subscribe({
      next: (res) => {
        console.log("[ADMIN][UsuarioList][cargar] Usuarios cargados exitosamente:", res.length);
        this.usuarios.set(res);
      },
      error: (err) => {
        console.error("[ADMIN][UsuarioList][cargar] Error al cargar usuarios:", err);
        this.toastService.error("No se pudieron cargar los usuarios");
      }
    });
  }

  filtrados = computed(() => {
    const q = this.searchTerm().toLowerCase();
    const f = this.filtroRol();
    return this.usuarios().filter(u => {
      if (u.rol?.nombre === 'CLIENTE') return false; // Exclusion de clientes
      const matchSearch = !q || u.nombres?.toLowerCase().includes(q) || u.apellidos?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
      const matchFiltro = f === '' || u.rol?.nombre === f;
      return matchSearch && matchFiltro;
    });
  });

  paginatedUsuarios = computed(() => {
    const list = this.filtrados();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filtrados().length / this.pageSize());
  });

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  onPageSizeChange(event: any) {
    this.pageSize.set(Number(event.target.value));
    this.currentPage.set(1);
  }

  onSearchChange(val: string) {
    this.searchTerm.set(val);
    this.currentPage.set(1);
  }

  onRolChange(val: string) {
    this.filtroRol.set(val);
    this.currentPage.set(1);
  }

  stats = computed(() => {
    const workers = this.usuarios().filter(u => u.rol?.nombre !== 'CLIENTE');
    return {
      total: workers.length,
      activos: workers.filter(u => u.estado).length,
      admins: workers.filter(u => u.rol?.nombre === 'ADMIN').length
    };
  });

  getAvatarColor(rol: string): string {
    const map: Record<string, string> = {
      'ADMIN': '#4f46e5',
      'RECEPCIONISTA': '#10b981',
      'MOZO': '#f59e0b',
      'COCINERO': '#ef4444'
    };
    return map[rol] || '#94a3b8';
  }

  getInitials(u: Usuario): string {
    return `${(u.nombres || '').charAt(0)}${(u.apellidos || '').charAt(0)}`.toUpperCase();
  }

  getRolClass(rol: string): string {
    return `rol-${rol.toLowerCase()}`;
  }

  toggleEstado(u: Usuario) {
    try {
      const nuevoEstado = !u.estado;
      const accion = nuevoEstado ? 'activar' : 'desactivar';
      console.log(`[ADMIN][UsuarioList][toggleEstado] Intentando ${accion} usuario ID: ${u.idUsuario}...`);

      this.usuarioService.toggleActivo(u.idUsuario!, nuevoEstado).subscribe({
        next: () => {
          console.log(`[ADMIN][UsuarioList][toggleEstado] Usuario ID ${u.idUsuario} ${nuevoEstado ? 'activado' : 'desactivado'} con éxito`);
          this.toastService.success(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`);
          this.cargar();
        },
        error: (err) => {
          console.error(`[ADMIN][UsuarioList][toggleEstado] Error al ${accion} usuario ID ${u.idUsuario}:`, err);
          this.toastService.error(`Error al ${accion} usuario`);
        }
      });
    } catch (error) {
      console.error("[ADMIN][UsuarioList][toggleEstado] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al cambiar el estado");
    }
  }

  eliminar(id: number) {
    try {
      if (confirm('¿Estás seguro de eliminar este usuario?')) {
        console.log(`[ADMIN][UsuarioList][eliminar] Intentando eliminar usuario ID: ${id}...`);
        this.usuarioService.delete(id).subscribe({
          next: () => {
            console.log(`[ADMIN][UsuarioList][eliminar] Usuario ID ${id} eliminado con éxito`);
            this.toastService.success('Usuario eliminado');
            this.cargar();
          },
          error: (err) => {
            console.error(`[ADMIN][UsuarioList][eliminar] Error al eliminar usuario ID ${id}:`, err);
            this.toastService.error('Error al eliminar usuario');
          }
        });
      }
    } catch (error) {
      console.error("[ADMIN][UsuarioList][eliminar] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al eliminar el usuario");
    }
  }

  abrirNuevo() {
    this.isEditMode.set(false);
    this.selectedUserId.set(null);
    this.showModal.set(true);
  }

  abrirEditar(id: number) {
    this.isEditMode.set(true);
    this.selectedUserId.set(id);
    this.showModal.set(true);
  }

  cerrarModal() {
    this.showModal.set(false);
    this.selectedUserId.set(null);
  }

  onUsuarioGuardado() {
    this.cerrarModal();
    this.cargar();
  }
}
