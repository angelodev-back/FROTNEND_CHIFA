import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MesaService } from '../../../../core/services/mesa.service';
import { MesaDTO } from '../../../../core/models/mesa.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AdminMesaForm } from '../mesa-form/mesa-form';

@Component({
  selector: 'app-admin-mesa-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, AdminMesaForm],
  templateUrl: './mesa-list.html',
  styleUrl: './mesa-list.css'
})
export class AdminMesaList implements OnInit {
  private mesaService = inject(MesaService);
  private toastService = inject(ToastService);

  searchQuery = signal('');
  filtroEstado = signal('');
  vista = signal<'grid' | 'tabla'>('grid');
  mesas = signal<MesaDTO[]>([]);

  // Modal State
  showModal = signal(false);
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);

  ngOnInit() {
    console.log("[ADMIN][MesaList] Inicializando componente de gestión de mesas...");
    this.cargar();
  }

  cargar() {
    console.log("[ADMIN][MesaList][cargar] Solicitando carga de mesas...");
    this.mesaService.getAll().subscribe({
      next: (res) => {
        console.log("[ADMIN][MesaList][cargar] Mesas cargadas exitosamente:", res.length);
        this.mesas.set(res);
      },
      error: (err) => {
        console.error("[ADMIN][MesaList][cargar] Error al cargar mesas:", err);
        this.toastService.error("No se pudieron cargar las mesas");
      }
    });
  }

  mesasFiltradas = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const f = this.filtroEstado();
    return this.mesas().filter(m => {
      const matchSearch = (m.numeroMesa?.toString().includes(q) || m.numero?.toString().includes(q));
      const matchFiltro = f === '' || m.estado === f;
      return matchSearch && matchFiltro;
    });
  });

  siguienteNumero = computed(() => {
    const all = this.mesas();
    if (all.length === 0) return 1;
    const max = Math.max(...all.map(m => parseInt((m.numeroMesa || m.numero) as any) || 0));
    return max + 1;
  });

  stats = computed(() => {
    const all = this.mesas();
    return {
      total: all.length,
      disponibles: all.filter(m => m.estado === 'DISPONIBLE').length,
      ocupadas: all.filter(m => m.estado === 'OCUPADA').length,
      reservadas: all.filter(m => m.estado === 'RESERVADA').length
    };
  });

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'DISPONIBLE': return 'badge-disponible';
      case 'OCUPADA': return 'badge-ocupada';
      case 'RESERVADA': return 'badge-reservada';
      case 'MANTENIMIENTO': return 'badge-mantenimiento';
      default: return '';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'DISPONIBLE': return 'Disponible';
      case 'OCUPADA': return 'Ocupada';
      case 'RESERVADA': return 'Reservada';
      case 'MANTENIMIENTO': return 'Mantenimiento';
      default: return estado;
    }
  }

  cambiarEstado(mesa: MesaDTO, estado: MesaDTO['estado']) {
    try {
      const id = mesa.idMesa || mesa.id;
      if (!id) {
        console.warn("[ADMIN][MesaList][cambiarEstado] No se encontró ID para la mesa:", mesa);
        return;
      }
      console.log(`[ADMIN][MesaList][cambiarEstado] Intentando cambiar estado a '${estado}' para mesa ID: ${id}...`);

      this.mesaService.updateStatus(id, estado).subscribe({
        next: () => {
          console.log(`[ADMIN][MesaList][cambiarEstado] Estado de mesa ID ${id} actualizado a '${estado}' con éxito`);
          this.toastService.success('Estado actualizado');
          this.cargar();
        },
        error: (err) => {
          console.error(`[ADMIN][MesaList][cambiarEstado] Error al actualizar estado de mesa ID ${id}:`, err);
          this.toastService.error('Error al actualizar estado');
        }
      });
    } catch (error) {
      console.error("[ADMIN][MesaList][cambiarEstado] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al cambiar el estado");
    }
  }

  eliminarMesa(mesa: MesaDTO) {
    try {
      const id = mesa.idMesa || mesa.id;
      if (!id) {
        console.warn("[ADMIN][MesaList][eliminarMesa] No se encontró ID para la mesa:", mesa);
        return;
      }
      if (confirm('¿Deseas eliminar esta mesa?')) {
        console.log(`[ADMIN][MesaList][eliminarMesa] Intentando eliminar mesa ID: ${id}...`);
        this.mesaService.delete(id).subscribe({
          next: () => {
            console.log(`[ADMIN][MesaList][eliminarMesa] Mesa ID ${id} eliminada con éxito`);
            this.toastService.success('Mesa eliminada');
            this.cargar();
          },
          error: (err) => {
            console.error(`[ADMIN][MesaList][eliminarMesa] Error al eliminar mesa ID ${id}:`, err);
            this.toastService.error('Error al eliminar mesa');
          }
        });
      }
    } catch (error) {
      console.error("[ADMIN][MesaList][eliminarMesa] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al eliminar la mesa");
    }
  }

  abrirNuevo() {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.showModal.set(true);
  }

  abrirEditar(id: number) {
    this.isEditMode.set(true);
    this.selectedId.set(id);
    this.showModal.set(true);
  }

  cerrarModal() {
    this.showModal.set(false);
    this.selectedId.set(null);
  }

  onSave() {
    this.cerrarModal();
    this.cargar();
  }
}
