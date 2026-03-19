import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { LoadingService } from '../../../core/services/loading.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { CategoriaService } from '../../../core/services/categoria.service';
import { MesaService } from '../../../core/services/mesa.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-mozo-tomar-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent],
  templateUrl: './mozo-tomar-pedido.component.html',
  styleUrl: './mozo-tomar-pedido.component.css'
})
export class MozoTomarPedidoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private mesaService = inject(MesaService);
  private pedidoService = inject(PedidoService);
  private toastService = inject(ToastService);

  // Estados
  idMesa = signal<number>(0);
  isLoading = signal<boolean>(true);
  isSubmitting = signal<boolean>(false);
  showSuccess = signal<boolean>(false);
  
  // Datos
  mesaActual = signal<any>(null);
  pedidoExistente = signal<any>(null);
  productos = signal<any[]>([]);
  categorias = signal<any[]>([]);
  
  // Filtros
  categoriaActiva = signal<number | null>(null);
  
  // Carrito
  carrito = signal<any[]>([]);
  observacionesGenerales = signal<string>('');

  // Computeds
  productosFiltrados = computed(() => {
    const catId = this.categoriaActiva();
    if (catId === null) return this.productos();
    return this.productos().filter(p => p.idCategoria === catId);
  });

  totalCarrito = computed(() => {
    return this.carrito().reduce((acc, curr) => acc + curr.subtotal, 0);
  });

  ngOnInit() {
    const mesaIdParam = this.route.snapshot.paramMap.get('idMesa');
    if (!mesaIdParam) {
      this.toastService.error("ID de mesa no válido");
      this.router.navigate(['/mozo/mesas']);
      return;
    }

    this.idMesa.set(Number(mesaIdParam));
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading.set(true);
    console.log(`[MOZO][TomarPedido] Cargando datos para mesa ${this.idMesa()}...`);

    // Fetch mesa
    this.mesaService.getById(this.idMesa()).subscribe({
      next: (m) => this.mesaActual.set(m),
      error: () => console.error("Error al cargar mesa")
    });

    // Fetch active order for this table
    this.pedidoService.getActivoPorMesa(this.idMesa()).subscribe({
      next: (p) => {
        if (p) {
          console.log("[MOZO][TomarPedido] Pedido existente encontrado:", p);
          this.pedidoExistente.set(p);
        }
      },
      error: () => console.warn("No hay pedido activo o error al buscar")
    });

    this.categoriaService.getAll().subscribe({
      next: (cats) => this.categorias.set(cats),
      error: () => console.error("Error al cargar categorías")
    });

    this.productoService.getActivos().subscribe({
      next: (prods) => {
        this.productos.set(prods);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error("Error al cargar productos", err);
        this.isLoading.set(false);
        this.toastService.error("Error al cargar la carta");
      }
    });
  }

  filtrarC(id: number | null) {
    this.categoriaActiva.set(id);
  }

  add(p: any) {
    if (p.stock <= 0) {
      this.toastService.warning("Producto sin stock");
      return;
    }

    const items = this.carrito();
    const index = items.findIndex(x => x.producto.idProducto === p.idProducto);

    if (index >= 0) {
      this.changeQty(index, 1);
    } else {
      const newItem = {
        producto: p,
        cantidad: 1,
        nota: '',
        subtotal: p.precio
      };
      this.carrito.set([...items, newItem]);
    }
  }

  changeQty(index: number, delta: number) {
    const items = [...this.carrito()];
    const item = items[index];
    const nuevaCant = item.cantidad + delta;

    if (nuevaCant <= 0) {
      items.splice(index, 1);
    } else {
      // Validar stock si es necesario (asumimos stock infinito por ahora o validamos si delta > 0)
      if (delta > 0 && item.cantidad >= item.producto.stock) {
        this.toastService.warning("Máximo stock alcanzado");
        return;
      }
      item.cantidad = nuevaCant;
      item.subtotal = item.cantidad * item.producto.precio;
    }
    this.carrito.set(items);
  }

  updateNote(index: number, note: string) {
    const items = [...this.carrito()];
    items[index].nota = note;
    this.carrito.set(items);
  }

  clear() {
    this.carrito.set([]);
    this.observacionesGenerales.set('');
  }

  enviar() {
    if (this.carrito().length === 0) return;

    this.isSubmitting.set(true);
    const pedido = {
      idMesa: this.idMesa(),
      tipoPedido: 'SALON',
      observaciones: this.observacionesGenerales(),
      detalles: this.carrito().map(c => ({
        idProducto: c.producto.idProducto,
        cantidad: c.cantidad,
        precioUnitario: c.producto.precio,
        nota: c.nota
      }))
    };

    console.log("[MOZO][TomarPedido] Enviando pedido...", pedido);

    const call = this.pedidoExistente() 
      ? this.pedidoService.agregarItems(this.pedidoExistente().idPedido, pedido)
      : this.pedidoService.crearPedido(pedido);

    call.subscribe({
      next: (res) => {
        this.toastService.success(this.pedidoExistente() ? "Items agregados al pedido" : "Pedido enviado a cocina");
        this.showSuccess.set(true);
        this.isSubmitting.set(false);
        // Si no existía, ahora ya existe para la siguiente adición
        if (!this.pedidoExistente()) {
          this.pedidoExistente.set(res);
        }
        this.clear(); // Limpiar carrito para la siguiente adición
      },
      error: (err) => {
        console.error("Error al procesar pedido:", err);
        this.isSubmitting.set(false);
        this.toastService.error("No se pudo procesar el pedido");
      }
    });
  }

  regresar() {
    this.router.navigate(['/mozo/mesas']);
  }

  continuarAgregando() {
    this.showSuccess.set(false);
  }
}
