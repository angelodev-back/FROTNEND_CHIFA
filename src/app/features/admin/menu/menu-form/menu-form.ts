import { Component, OnInit, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../../../core/services/producto.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ProductoDTO } from '../../../../core/models/producto.model';
import { CategoriaDTO } from '../../../../core/models/categoria.model';

@Component({
  selector: 'app-admin-menu-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './menu-form.html',
  styleUrl: './menu-form.css'
})
export class AdminMenuForm implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  menuForm!: FormGroup;
  categorias: CategoriaDTO[] = [];
  submitting = false;

  @Input() isModal = false;
  @Input() isEditMode = false;
  @Input() productoId: number | null = null;

  @Output() onSave = new EventEmitter<ProductoDTO>();
  @Output() onCancel = new EventEmitter<void>();

  ngOnInit() {
    console.log("[ADMIN][MenuForm] Inicializando componente de formulario de menú...");
    this.initForm();
    this.cargarCategorias();

    if (this.isModal) {
      if (this.isEditMode && this.productoId) {
        this.cargarProducto(this.productoId);
      }
    } else {
      this.checkEditMode();
    }
  }

  private initForm() {
    console.log("[ADMIN][MenuForm][initForm] Configurando validaciones del formulario...");
    this.menuForm = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      precio: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imagenUrl: [''],
      idCategoria: [null, [Validators.required]],
      estado: [true]
    });
  }

  private cargarCategorias() {
    console.log("[ADMIN][MenuForm][cargarCategorias] Solicitando lista de categorías...");
    this.categoriaService.getAll().subscribe({
      next: (data) => {
        console.log("[ADMIN][MenuForm][cargarCategorias] Categorías cargadas:", data.length);
        this.categorias = data;
      },
      error: (err) => {
        console.error("[ADMIN][MenuForm][cargarCategorias] Error al cargar categorías:", err);
        this.toastService.error('Error al cargar categorías');
      }
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      console.log("[ADMIN][MenuForm][checkEditMode] Modo EDICIÓN detectado para producto ID:", id);
      this.isEditMode = true;
      this.productoId = +id;
      this.cargarProducto(this.productoId);
    } else {
      console.log("[ADMIN][MenuForm][checkEditMode] Modo CREACIÓN detectado");
    }
  }

  private cargarProducto(id: number) {
    console.log(`[ADMIN][MenuForm][cargarProducto] Solicitando datos del producto ID ${id}...`);
    this.productoService.getById(id).subscribe({
      next: (prod) => {
        console.log("[ADMIN][MenuForm][cargarProducto] Datos cargados:", prod);
        this.menuForm.patchValue({
          nombre: prod.nombre,
          descripcion: prod.descripcion,
          precio: prod.precio,
          stock: prod.stock,
          imagenUrl: prod.imagenUrl,
          idCategoria: prod.idCategoria,
          estado: prod.estado
        });
      },
      error: (err) => {
        console.error(`[ADMIN][MenuForm][cargarProducto] Error al cargar producto ID ${id}:`, err);
        this.toastService.error('Error al cargar producto');
      }
    });
  }

  onSubmit() {
    try {
      if (this.menuForm.invalid) {
        console.warn("[ADMIN][MenuForm][onSubmit] Formulario inválido:", this.menuForm.value);
        this.menuForm.markAllAsTouched();
        return;
      }

      this.submitting = true;
      const val = this.menuForm.value;
      console.log("[ADMIN][MenuForm][onSubmit] Enviando datos:", val);

      if (this.isEditMode && this.productoId) {
        console.log(`[ADMIN][MenuForm][onSubmit] Actualizando producto ID ${this.productoId}...`);
        this.productoService.update(this.productoId, val).subscribe({
          next: (res) => {
            console.log("[ADMIN][MenuForm][onSubmit] Producto actualizado con éxito");
            this.toastService.success('Producto actualizado');
            if (this.isModal) {
              this.onSave.emit(res);
            } else {
              this.router.navigate(['/admin/menu']);
            }
          },
          error: (err) => {
            console.error("[ADMIN][MenuForm][onSubmit] Error en la actualización:", err);
            this.toastService.error('Error al actualizar');
            this.submitting = false;
          }
        });
      } else {
        console.log("[ADMIN][MenuForm][onSubmit] Creando nuevo producto...");
        this.productoService.create(val).subscribe({
          next: (res) => {
            console.log("[ADMIN][MenuForm][onSubmit] Producto creado con éxito:", res);
            this.toastService.success('Producto creado');
            if (this.isModal) {
              this.onSave.emit(res);
            } else {
              this.router.navigate(['/admin/menu']);
            }
          },
          error: (err) => {
            console.error("[ADMIN][MenuForm][onSubmit] Error en la creación:", err);
            this.toastService.error('Error al crear');
            this.submitting = false;
          }
        });
      }
    } catch (error) {
      console.error("[ADMIN][MenuForm][onSubmit] Error crítico inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al procesar el formulario");
      this.submitting = false;
    }
  }
  getCategoriaName(id: number | null): string {
    if (!id) return 'Sin Categoría';
    const cat = this.categorias.find(c => c.idCategoria === id);
    return cat ? cat.nombre : 'Categoría No Encontrada';
  }
}
