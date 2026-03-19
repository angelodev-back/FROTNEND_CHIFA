import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-wrapper">
      <!-- Hero -->
      <div class="checkout-hero">
        <h1>🛒 Finalizar Pedido</h1>
        <p>Revisa tu selección y confirma los detalles de entrega.</p>
      </div>

      <!-- Empty Cart -->
      <div class="empty-cart" *ngIf="cart.count() === 0">
        <span>🛒</span>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega platos desde nuestro menú para continuar.</p>
        <a routerLink="/cliente/menu" class="btn-go-menu">Ver Menú</a>
      </div>

      <div class="checkout-grid" *ngIf="cart.count() > 0">
        <!-- Resumen de pedido -->
        <div class="order-summary">
          <h2>Resumen de tu Pedido</h2>
          <div class="summary-items">
            <div class="summary-item" *ngFor="let item of cart.cartItems()">
              <img [src]="item.imagenUrl || 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=80&q=60'" 
                   [alt]="item.nombre" class="item-img">
              <div class="item-info">
                <span class="item-name">{{ item.nombre }}</span>
                <div class="item-qty-control">
                  <button (click)="cart.updateQuantity(item.idProducto, item.cantidad - 1)">−</button>
                  <span>{{ item.cantidad }}</span>
                  <button (click)="cart.updateQuantity(item.idProducto, item.cantidad + 1)">+</button>
                </div>
              </div>
              <div class="item-right">
                <span class="item-price">S/ {{ (item.precio * item.cantidad) | number:'1.2-2' }}</span>
                <button class="btn-remove" (click)="cart.removeFromCart(item.idProducto)">✕</button>
              </div>
            </div>
          </div>

          <div class="cost-breakdown">
            <div class="cost-row">
              <span>Subtotal</span>
              <span>S/ {{ cart.total() | number:'1.2-2' }}</span>
            </div>
            <div class="cost-row delivery">
              <span>🚚 Envío</span>
              <span>S/ 5.00</span>
            </div>
            <div class="cost-row total">
              <span>Total a Pagar</span>
              <span>S/ {{ (cart.total() + 5) | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Formulario de entrega -->
        <div class="delivery-form">
          <h2>Detalles de Entrega</h2>

          <div class="field">
            <label>📍 Dirección de Entrega</label>
            <input type="text" [(ngModel)]="direccion" placeholder="Ej: Av. Larco 123, Miraflores">
          </div>

          <div class="field">
            <label>💳 Método de Pago</label>
            <div class="payment-options">
              <label class="pay-opt" [class.selected]="metodoPago === 'EFECTIVO'" (click)="metodoPago = 'EFECTIVO'">
                💵 Efectivo
              </label>
              <label class="pay-opt" [class.selected]="metodoPago === 'TARJETA'" (click)="metodoPago = 'TARJETA'">
                💳 Tarjeta
              </label>
              <label class="pay-opt" [class.selected]="metodoPago === 'YAPE'" (click)="metodoPago = 'YAPE'">
                📱 Yape / Plin
              </label>
            </div>
          </div>

          <div class="field">
            <label>💬 Notas Especiales <small>(Opcional)</small></label>
            <textarea [(ngModel)]="observaciones" rows="3" placeholder="Ej: Sin cebolla, extra ají, etc."></textarea>
          </div>

          <button class="btn-confirm" 
                  [disabled]="!direccion || loading()"
                  (click)="confirmarPedido()">
            <span *ngIf="!loading()">✅ Confirmar y Pagar · S/ {{ (cart.total() + 5) | number:'1.2-2' }}</span>
            <span *ngIf="loading()" class="loading-text">
              <i class="sp"></i> Procesando tu pedido...
            </span>
          </button>

          <div class="secure-note">
            🔒 Tu pedido está protegido. Pago seguro y confirmado.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .checkout-hero {
      background: linear-gradient(135deg, #1d3557, #2a4a73);
      color: white; padding: 5rem 2rem 4rem; text-align: center;
    }
    .checkout-hero h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.75rem; }
    .checkout-hero p { color: rgba(255,255,255,0.7); font-size: 1.1rem; }

    .empty-cart {
      text-align: center; padding: 6rem 2rem;
    }
    .empty-cart span { font-size: 5rem; display: block; margin-bottom: 1.5rem; }
    .empty-cart h2 { font-size: 1.8rem; font-weight: 700; color: #1d3557; margin-bottom: 0.75rem; }
    .empty-cart p { color: #888; font-size: 1.1rem; margin-bottom: 2rem; }
    .btn-go-menu {
      padding: 0.9rem 2rem; background: #e63946; color: white;
      text-decoration: none; border-radius: 12px; font-weight: 700;
    }

    .checkout-grid {
      display: grid; grid-template-columns: 1.1fr 1fr; gap: 3rem;
      max-width: 1100px; margin: 0 auto; padding: 3rem 2rem 6rem;
    }

    /* Order Summary */
    .order-summary h2, .delivery-form h2 { 
      font-size: 1.3rem; font-weight: 800; color: #1d3557; margin-bottom: 1.5rem;
    }
    .summary-items { margin-bottom: 1.5rem; }
    .summary-item {
      display: flex; align-items: center; gap: 1rem; padding: 1rem 0;
      border-bottom: 1px solid #f0f4f8;
    }
    .item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; }
    .item-info { flex: 1; }
    .item-name { font-weight: 600; color: #333; display: block; margin-bottom: 0.4rem; font-size: 0.95rem; }
    .item-qty-control { display: flex; align-items: center; gap: 0.75rem; }
    .item-qty-control button { 
      width: 26px; height: 26px; border: 1px solid #ddd; background: white;
      border-radius: 50%; cursor: pointer; font-size: 1rem; font-weight: 700; transition: all 0.2s;
    }
    .item-qty-control button:hover { background: #e63946; color: white; border-color: #e63946; }
    .item-qty-control span { font-weight: 700; min-width: 20px; text-align: center; }
    .item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
    .item-price { font-weight: 800; color: #1d3557; font-size: 0.95rem; }
    .btn-remove { background: none; border: none; color: #ccc; cursor: pointer; font-size: 1rem; }
    .btn-remove:hover { color: #e74c3c; }

    .cost-breakdown { background: #f8f9fa; border-radius: 16px; padding: 1.5rem; }
    .cost-row { display: flex; justify-content: space-between; padding: 0.6rem 0; color: #555; }
    .cost-row.delivery { border-bottom: 1px solid #eee; padding-bottom: 1rem; margin-bottom: 0.5rem; }
    .cost-row.total { font-size: 1.3rem; font-weight: 800; color: #1d3557; }

    /* Delivery Form */
    .delivery-form { background: white; border-radius: 24px; padding: 2.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.07); }
    .field { margin-bottom: 1.5rem; }
    .field label { display: block; font-weight: 600; color: #555; margin-bottom: 0.6rem; font-size: 0.9rem; }
    .field input, .field textarea { 
      width: 100%; padding: 0.85rem 1rem; border: 2px solid #e8ecf0;
      border-radius: 12px; font-size: 1rem; transition: border 0.2s; box-sizing: border-box;
    }
    .field input:focus, .field textarea:focus { outline: none; border-color: #e63946; }

    .payment-options { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; }
    .pay-opt {
      background: #f8f9fa; border: 2px solid transparent; border-radius: 12px;
      padding: 0.9rem 0.5rem; text-align: center; cursor: pointer; font-weight: 600;
      color: #555; transition: all 0.2s; font-size: 0.88rem;
    }
    .pay-opt.selected { background: #fff3f3; border-color: #e63946; color: #e63946; }

    .btn-confirm { 
      width: 100%; padding: 1.2rem; background: linear-gradient(135deg, #e63946, #c1121f);
      color: white; border: none; border-radius: 14px; font-weight: 800;
      font-size: 1.05rem; cursor: pointer; transition: all 0.3s;
      box-shadow: 0 8px 25px rgba(230,57,70,0.4); margin-top: 0.5rem;
    }
    .btn-confirm:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(230,57,70,0.45); }
    .btn-confirm:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }
    .loading-text { display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
    .sp { width: 18px; height: 18px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; display: inline-block; animation: spin 0.6s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .secure-note { text-align: center; color: #aaa; font-size: 0.8rem; margin-top: 1rem; }

    @media (max-width: 768px) { .checkout-grid { grid-template-columns: 1fr; } .payment-options { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutComponent {
  cart = inject(CartService);
  private pedidoService = inject(PedidoService);
  private toast = inject(ToastService);
  private router = inject(Router);

  direccion = '';
  metodoPago = 'EFECTIVO';
  observaciones = '';
  loading = signal(false);

  confirmarPedido() {
    this.loading.set(true);
    const pedidoRequest = {
      tipoPedido: 'DELIVERY',
      observaciones: `${this.observaciones} | Pago: ${this.metodoPago} | Dirección: ${this.direccion}`,
      detalles: this.cart.cartItems().map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad
      }))
    };

    this.pedidoService.crearPedido(pedidoRequest).subscribe({
      next: () => {
        this.toast.success('¡Pedido realizado con éxito! Te notificaremos cuando esté listo. 🎉');
        this.cart.clearCart();
        this.router.navigate(['/cliente/perfil']);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Error al procesar el pedido. Verifica tu sesión e inténtalo de nuevo.');
        this.loading.set(false);
      }
    });
  }
}
