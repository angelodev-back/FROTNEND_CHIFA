import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../../core/services/producto.service';
import { ProductoDTO } from '../../../core/models/producto.model';

@Component({
    selector: 'app-menu-public',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="menu-wrapper">
            <header>
                <h1>📜 Nuestra Carta Digital</h1>
                <p>Disfruta de la mejor sazón oriental en Chifa Linda</p>
            </header>

            <div *ngIf="loading" class="loader">Cargando menú...</div>
            
            <div *ngIf="!loading && productos.length > 0" class="product-grid">
                <div *ngFor="let prod of productos" class="product-card">
                    <div class="product-info">
                        <h3>{{ prod.nombre }}</h3>
                        <p>{{ prod.descripcion }}</p>
                        <span class="price">S/ {{ prod.precio | number:'1.2-2' }}</span>
                    </div>
                </div>
            </div>

            <div *ngIf="!loading && productos.length === 0" class="empty-menu">
                <div class="icon">🥡</div>
                <h2>Carta disponible próximamente</h2>
                <p>Estamos actualizando nuestros platos para brindarte la mejor experiencia.</p>
            </div>
        </div>
    `,
    styles: [`
        .menu-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; }
        header { text-align: center; margin-bottom: 3rem; }
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
        .product-card { border: 1px solid #eee; border-radius: 12px; padding: 1.5rem; background: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .product-info h3 { margin-top: 0; color: #d32f2f; }
        .price { font-weight: bold; color: #388e3c; font-size: 1.2rem; display: block; margin-top: 1rem; }
        .empty-menu { text-align: center; padding: 5rem; color: #666; }
        .empty-menu .icon { font-size: 4rem; margin-bottom: 1rem; }
    `]
})
export class MenuComponent implements OnInit {
    private productoService = inject(ProductoService);
    productos: ProductoDTO[] = [];
    loading = true;

    ngOnInit(): void {
        this.productoService.getPublic().subscribe({
            next: (data) => {
                this.productos = data;
                this.loading = false;
            },
            error: () => {
                this.productos = [];
                this.loading = false;
            }
        });
    }
}
