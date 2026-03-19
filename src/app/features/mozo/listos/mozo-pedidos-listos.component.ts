import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MozoPedidoService } from '../../../core/services/mozo-pedido.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-mozo-pedidos-listos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mozo-page admin-page">
      
      <!-- High-Urgency Header -->
      <div class="admin-page-header">
        <div class="aph-left">
          <div class="aph-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <h1 class="aph-title">Despacho Inmediato</h1>
          </div>
        </div>
        <div class="aph-right">
           <div class="serving-counter" *ngIf="pedidos().length > 0">
              <span class="sc-dot animate-ping"></span>
              {{ pedidos().length }} ÓRDENES PENDIENTES
           </div>
        </div>
      </div>

      <div class="alert-enterprise-grid" *ngIf="pedidos().length > 0">
        <div class="order-ready-card animate-slide-up" *ngFor="let p of pedidos()">
          <div class="orc-status-stripe"></div>
          
          <div class="orc-content">
            <div class="orc-table-ident">
               <span class="ti-label">MESA</span>
               <span class="ti-value">{{ p.numeroMesa }}</span>
            </div>

            <div class="orc-details">
               <div class="orc-id">Orden #{{ p.idPedido }}</div>
               <h3 class="orc-msg">¡Lista para Servir!</h3>
               <div class="orc-pills">
                  <span class="orc-pill">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ p.items?.length || 0 }} productos
                  </span>
                  <span class="orc-pill-time">CRÍTICO</span>
               </div>
            </div>

            <button class="btn btn-primary btn-serve-action" (click)="servir(p.idPedido!)">
              Marcar Servicio Completo
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State / Clean Desk -->
      <div class="empty-state-enterprise" *ngIf="pedidos().length === 0">
         <div class="ese-artwork">🎯</div>
         <h3>Salón en Orden</h3>
         <p>No hay pedidos pendientes de entrega. Todas las órdenes están siendo procesadas en cocina o ya fueron servidas.</p>
         <button class="btn btn-ghost btn-sm mt-4" routerLink="/mozo/dashboard">Regresar al Panel</button>
      </div>
    </div>
  `,
  styles: [`
    .mozo-page { padding: 3rem 4rem; max-width: 100%; margin: 0; }
    
    .admin-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 3.5rem !important;
    }

    .aph-left { display: flex; align-items: center; gap: 1.5rem; }

    .aph-title {
      font-size: 4rem !important;
      font-weight: 950;
      letter-spacing: -0.04em;
      color: #0f172a;
      line-height: 1;
      margin: 0;
    }

    .aph-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    
    .serving-counter {
      display: flex; align-items: center; gap: 0.75rem;
      background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;
      padding: 0.5rem 1rem; border-radius: 12px; font-size: 0.75rem; font-weight: 950;
    }
    
    .sc-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; }

    .alert-enterprise-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); 
      gap: 1.5rem; 
      margin-top: 2rem; 
    }

    .order-ready-card {
      background: white; border-radius: 28px; position: relative;
      overflow: hidden; border: 1px solid #f1f5f9;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
      display: flex; flex-direction: column;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .order-ready-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); border-color: #10b981; }

    .orc-status-stripe { height: 6px; background: linear-gradient(90deg, #10b981, #34d399); }

    .orc-content { padding: 2rem; display: grid; grid-template-columns: 80px 1fr; gap: 1.5rem; }

    .orc-table-ident {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: #eff6ff; border-radius: 20px; border: 1px solid #dbeafe;
    }
    .ti-label { font-size: 0.6rem; font-weight: 900; color: #3b82f6; text-transform: uppercase; }
    .ti-value { font-family: 'Outfit'; font-weight: 950; font-size: 2.25rem; color: #1d4ed8; line-height: 1; }

    .orc-details { flex: 1; }
    .orc-id { font-size: 0.75rem; font-weight: 850; color: #94a3b8; margin-bottom: 0.25rem; }
    .orc-msg { font-size: 1.25rem; font-weight: 900; color: #0f172a; margin-bottom: 0.75rem; }
    
    .orc-pills { display: flex; gap: 0.5rem; }
    .orc-pill { 
      background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;
      font-size: 0.65rem; font-weight: 850; padding: 0.25rem 0.6rem; border-radius: 6px;
      display: flex; align-items: center; gap: 0.3rem;
    }
    .orc-pill-time { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; font-size: 0.65rem; font-weight: 900; padding: 0.25rem 0.6rem; border-radius: 6px; }

    .btn-serve-action { grid-column: 1 / span 2; padding: 1rem; border-radius: 16px; font-weight: 950; font-size: 1rem; letter-spacing: 0.02em; margin-top: 0.5rem; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2); }

    .empty-state-enterprise { padding: 8rem 2rem; text-align: center; background: white; border: 1px solid #f1f5f9; border-radius: 32px; margin-top: 2rem; }
    .ese-artwork { font-size: 4rem; margin-bottom: 1.5rem; animation: tsp-float 3s infinite ease-in-out; }
    @keyframes tsp-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
    .empty-state-enterprise h3 { font-family: 'Outfit'; font-weight: 900; font-size: 1.75rem; color: #0f172a; margin-bottom: 0.75rem; }
    .empty-state-enterprise p { color: #94a3b8; font-weight: 500; max-width: 500px; margin: 0 auto; line-height: 1.6; }
  `]
})
export class MozoPedidosListosComponent implements OnInit {
  private pedidoService = inject(MozoPedidoService);
  private toastService = inject(ToastService);

  pedidos = signal<any[]>([]);

  ngOnInit() {
    console.log("[MOZO][PedidosListos] Inicializando componente de alertas de pedidos listos...");
    this.cargarListos();
  }

  cargarListos() {
    console.log("[MOZO][PedidosListos][cargarListos] Solicitando pedidos en estado LISTO...");
    this.pedidoService.getMisPedidos('LISTO').subscribe({
      next: (res) => {
        console.log("[MOZO][PedidosListos][cargarListos] Pedidos listos cargados:", res.length);
        this.pedidos.set(res);
      },
      error: (err) => {
        console.error("[MOZO][PedidosListos][cargarListos] Error al cargar pedidos listos:", err);
      }
    });
  }

  servir(id: number) {
    try {
      console.log(`[MOZO][PedidosListos][servir] Intentando marcar como SERVIDO el pedido ID: ${id}...`);
      this.pedidoService.marcarComoServido(id).subscribe({
        next: () => {
          console.log(`[MOZO][PedidosListos][servir] Pedido ID ${id} servido con éxito`);
          this.toastService.success('¡Buen provecho! Pedido entregado.');
          this.cargarListos();
        },
        error: (err) => {
          console.error(`[MOZO][PedidosListos][servir] Error al servir pedido ID ${id}:`, err);
          this.toastService.error('Error al actualizar el pedido');
        }
      });
    } catch (error) {
      console.error("[MOZO][PedidosListos][servir] Error inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado");
    }
  }
}
