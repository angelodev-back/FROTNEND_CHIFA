import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../../core/services/producto.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { WsService } from '../../../../core/services/ws.service';
import { ProductoDTO } from '../../../../core/models/producto.model';
import { CategoriaDTO } from '../../../../core/models/categoria.model';
import { ToastService } from '../../../../core/services/toast.service';

import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { AdminMenuForm } from '../menu-form/menu-form';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-admin-menu-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, AdminMenuForm, KpiCardComponent],
  templateUrl: './menu-list.html',
  styleUrl: './menu-list.css'
})
export class AdminMenuList implements OnInit {
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private wsService = inject(WsService);
  private toastService = inject(ToastService);

  searchQuery = signal('');
  filtroCategoria = signal('');
  filtroEstado = signal('');

  productos = signal<ProductoDTO[]>([]);
  categorias = signal<CategoriaDTO[]>([]);

  // Modal State
  showModal = signal(false);
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);

  // Pagination State
  pageSize = signal(10);
  currentPage = signal(1);
  Math = Math;

  ngOnInit() {
    console.log("[ADMIN][MenuList] Inicializando componente de menú...");
    this.cargar();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wsService.subscribe('/topic/productos').subscribe({
      next: () => this.cargar()
    });
  }

  cargar() {
    console.log("[ADMIN][MenuList][cargar] Solicitando carga de productos y categorías...");

    this.productoService.getAll().subscribe({
      next: (res) => {
        console.log("[ADMIN][MenuList][cargar] Productos cargados:", res.length);
        this.productos.set(res);
      },
      error: (err) => {
        console.error("[ADMIN][MenuList][cargar] Error al cargar productos:", err);
        this.toastService.error("No se pudieron cargar los productos");
      }
    });

    this.categoriaService.getAll().subscribe({
      next: (res) => {
        console.log("[ADMIN][MenuList][cargar] Categorías cargadas:", res.length);
        this.categorias.set(res);
      },
      error: (err) => {
        console.error("[ADMIN][MenuList][cargar] Error al cargar categorías:", err);
      }
    });
  }

  filtrados = computed(() => {
    return this.productos().filter(p => {
      const q = this.searchQuery().toLowerCase();
      const ms = !q ||
        (p.nombre || '').toLowerCase().includes(q) ||
        (p.nombreCategoria || '').toLowerCase().includes(q);

      const mc = !this.filtroCategoria() || p.idCategoria.toString() === this.filtroCategoria();
      
      const fEstado = this.filtroEstado();
      const me = !fEstado || (fEstado === 'ACTIVO' ? p.estado : !p.estado);
      
      return ms && mc && me;
    });
  });

  paginatedProductos = computed(() => {
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

  stats = computed(() => {
    const list = this.productos();
    return {
      total: list.length,
      activos: list.filter(p => p.estado).length,
      stockBajo: list.filter(p => p.stock < 10).length,
      categoriasCount: this.categorias().length,
    };
  });

  onSearchChange(val: string) {
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  onCategoriaChange(val: string) {
    this.filtroCategoria.set(val);
    this.currentPage.set(1);
  }

  onEstadoChange(val: string) {
    this.filtroEstado.set(val);
    this.currentPage.set(1);
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

  toggleEstado(p: ProductoDTO) {
    try {
      const nuevoEstado = !p.estado;
      const accion = nuevoEstado ? 'activar' : 'desactivar';
      console.log(`[ADMIN][MenuList][toggleEstado] Intentando ${accion} producto ID: ${p.idProducto}...`);

      this.productoService.update(p.idProducto, { estado: nuevoEstado }).subscribe({
        next: () => {
          console.log(`[ADMIN][MenuList][toggleEstado] Producto ID ${p.idProducto} ${nuevoEstado ? 'activado' : 'desactivado'} con éxito`);
          this.toastService.success(`Producto ${nuevoEstado ? 'activado' : 'desactivado'}`);
          this.cargar();
        },
        error: (err) => {
          console.error(`[ADMIN][MenuList][toggleEstado] Error al ${accion} producto ID ${p.idProducto}:`, err);
          this.toastService.error(`Error al ${accion} producto`);
        }
      });
    } catch (error) {
      console.error("[ADMIN][MenuList][toggleEstado] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al cambiar el estado");
    }
  }

  eliminar(id: number) {
    try {
      if (confirm('¿Estás seguro de eliminar este producto?')) {
        console.log(`[ADMIN][MenuList][eliminar] Intentando eliminar producto ID: ${id}...`);
        this.productoService.delete(id).subscribe({
          next: () => {
            console.log(`[ADMIN][MenuList][eliminar] Producto ID ${id} eliminado con éxito`);
            this.toastService.success('Producto eliminado');
            this.cargar();
          },
          error: (err) => {
            console.error(`[ADMIN][MenuList][eliminar] Error al eliminar producto ID ${id}:`, err);
            this.toastService.error('Error al eliminar producto');
          }
        });
      }
    } catch (error) {
      console.error("[ADMIN][MenuList][eliminar] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al eliminar el producto");
    }
  }
}
