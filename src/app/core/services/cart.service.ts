import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
    idProducto: number;
    nombre: string;
    precio: number;
    cantidad: number;
    imagenUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private items = signal<CartItem[]>([]);

    readonly cartItems = this.items.asReadonly();

    readonly total = computed(() =>
        this.items().reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
    );

    readonly count = computed(() =>
        this.items().reduce((acc, item) => acc + item.cantidad, 0)
    );

    addToCart(product: any) {
        const current = this.items();
        const existing = current.find(i => i.idProducto === product.idProducto);

        if (existing) {
            this.items.update(items => items.map(i =>
                i.idProducto === product.idProducto
                    ? { ...i, cantidad: i.cantidad + 1 }
                    : i
            ));
        } else {
            this.items.update(items => [...items, {
                idProducto: product.idProducto,
                nombre: product.nombre,
                precio: product.precio,
                cantidad: 1,
                imagenUrl: product.imagenUrl
            }]);
        }
    }

    removeFromCart(id: number) {
        this.items.update(items => items.filter(i => i.idProducto !== id));
    }

    clearCart() {
        this.items.set([]);
    }

    updateQuantity(id: number, cantidad: number) {
        if (cantidad <= 0) {
            this.removeFromCart(id);
            return;
        }
        this.items.update(items => items.map(i =>
            i.idProducto === id ? { ...i, cantidad } : i
        ));
    }
}
