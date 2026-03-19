import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicService } from '../../../core/services/public.service';

@Component({
  selector: 'app-client-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-menu.component.html',
  styleUrl: './client-menu.component.css'
})
export class ClientMenuComponent implements OnInit {
  private publicService = inject(PublicService);

  categorias = signal<any[]>([]);
  catSeleccionada = signal<any>(null);
  searchQuery = '';
  productos = signal<any[]>([]);

  ngOnInit() {
    console.log("[CLIENTE][Menu] Inicializando carta digital...");
    this.publicService.getCategorias().subscribe({
      next: (cats) => {
        console.log("[CLIENTE][Menu] Categorías cargadas:", cats.length);
        this.categorias.set(cats);
      },
      error: (err) => {
        console.error("[CLIENTE][Menu] Error al cargar categorías:", err);
      }
    });

    this.publicService.getMenuPublico().subscribe({
      next: (prods) => {
        console.log("[CLIENTE][Menu] Productos cargados:", prods.length);
        this.productos.set(prods);
      },
      error: (err) => {
        console.error("[CLIENTE][Menu] Error al cargar productos:", err);
      }
    });
  }

  seleccionarCategoria(cat: any) {
    console.log(`[CLIENTE][Menu][seleccionarCategoria] Categoría: ${cat.nombre}`);
    this.catSeleccionada.set(cat);
  }

  filteredProducts() {
    try {
      return this.productos().filter(p => {
        const catId = this.catSeleccionada()?.idCategoria;
        const matchesCat = !catId || p.idCategoria === catId;
        const matchesSearch = p.nombre.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      });
    } catch (error) {
      console.error("[CLIENTE][Menu][filteredProducts] Error al filtrar:", error);
      return [];
    }
  }

  resetFilters() {
    this.catSeleccionada.set(null);
    this.searchQuery = '';
  }
}
