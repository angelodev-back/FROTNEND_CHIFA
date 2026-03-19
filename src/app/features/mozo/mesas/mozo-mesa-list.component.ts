import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MesaService } from '../../../core/services/mesa.service';
import { AuthService } from '../../../core/services/auth.service';
import { WsService } from '../../../core/services/ws.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mozo-mesa-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mozo-page admin-page">
      
      <!-- Premium Service Header -->
      <div class="admin-page-header">
        <div class="aph-left">
          <div class="aph-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3h18v18H3zM3 9h18M9 3v18"/></svg>
          </div>
          <div>
            <h1 class="aph-title">Mapa de Salón</h1>
          </div>
        </div>
        <div class="aph-right">
           <div class="salit-legend">
              <span class="legend-item"><span class="dot disp"></span> Libre</span>
              <span class="legend-item"><span class="dot ocup"></span> Ocupada</span>
              <span class="legend-item"><span class="dot mia"></span> Propia</span>
              <span class="legend-item"><span class="dot pago"></span> Cobrando</span>
           </div>
        </div>
      </div>

      <div class="mesas-enterprise-grid">
        <div class="mesa-premium-card" 
             *ngFor="let m of mesas()" 
             [ngClass]="['status-' + m.estado?.toLowerCase(), m.atendidaPorMi ? 'is-owner' : '', 'order-' + m.estadoPedidoActual?.toLowerCase()]">
          
          <div class="mpc-badge" *ngIf="m.atendidaPorMi">MI MESA</div>
          <div class="mpc-ready-indicator" *ngIf="m.atendidaPorMi && m.estadoPedidoActual === 'LISTO'">
            <div class="bell-ring">🔔</div>
          </div>

          <div class="mpc-header">
            <span class="mpc-number">Mesa {{ m.numeroMesa }}</span>
            <div class="mpc-state-indicator">
              <span class="state-dot"></span>
              <span class="state-text">{{ m.estado === 'EN_PAGO' ? 'COBRANDO' : m.estado }}</span>
            </div>
          </div>

          <div class="mpc-body">
            <div class="mpc-main-stat">
              <div class="mpc-capacity">
                 <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                 {{ m.capacidad }}
              </div>
              <div class="mpc-role-icon">
                <i class="bi bi-wallet2" *ngIf="m.estado === 'EN_PAGO'"></i>
                <i class="bi bi-person-workspace" *ngIf="m.estado === 'OCUPADA'"></i>
                <i class="bi bi-check-circle-fill" *ngIf="m.estado === 'DISPONIBLE'"></i>
                <i class="bi bi-calendar-check" *ngIf="m.estado === 'RESERVADA'"></i>
              </div>
            </div>

            <div class="mpc-details">
               <!-- Seccion Mozo / Pedido -->
               <div class="mpc-occupancy-info" *ngIf="m.estado === 'OCUPADA' || m.estado === 'EN_PAGO' || m.estado === 'ESPERANDO_PAGO'">
                 <div class="mpc-mozo-line">
                    <span class="mozo-avatar" [style.background]="(m.estado === 'EN_PAGO' || m.estado === 'ESPERANDO_PAGO') ? '#f59e0b' : '#4f46e5'">{{ (m.nombreMozoAsignado || 'M')?.charAt(0) }}</span>
                    <span class="mozo-name">{{ m.atendidaPorMi ? 'TÚ (Asignado)' : (m.nombreMozoAsignado || 'Staff') }}</span>
                 </div>
                 
                 <div class="mpc-order-status" *ngIf="m.estadoPedidoActual" [ngClass]="'os-' + m.estadoPedidoActual.toLowerCase()">
                   <span class="os-dot"></span>
                   {{ m.estadoPedidoActual === 'PENDIENTE' ? 'EN COLA' : (m.estadoPedidoActual === 'EN_PAGO' || m.estadoPedidoActual === 'ESPERANDO_PAGO' ? 'CUENTA EMITIDA' : m.estadoPedidoActual) }}
                 </div>
               </div>
               
               <div class="mpc-empty-info" *ngIf="m.estado === 'DISPONIBLE'">
                 Lista para recibir comensales
               </div>
            </div>
          </div>

          <div class="mpc-actions">
            <!-- Botón Atender: Si está Disponible o está Ocupada pero nadie la tomó -->
            <button *ngIf="m.estado === 'DISPONIBLE' || (m.estado === 'OCUPADA' && !m.idMozoAsignado)" 
                    class="mpc-btn btn-primary-glass" 
                    (click)="atenderMesa(m.idMesa)">
              Atender Mesa
            </button>
            
            <!-- Botones Mi Mesa (Cuando ya la atiendo yo) -->
            <div class="mpc-btn-group" *ngIf="(m.estado === 'OCUPADA' || m.estado === 'EN_PAGO' || m.estado === 'ESPERANDO_PAGO') && m.atendidaPorMi">
              <button class="mpc-btn btn-indigo" [routerLink]="['/mozo/tomar-pedido', m.idMesa]" [disabled]="m.estado === 'EN_PAGO' || m.estado === 'ESPERANDO_PAGO'">
                {{ m.estadoPedidoActual ? 'Ver / Agregar' : 'Hacer Pedido' }}
              </button>
              <button class="mpc-btn" [ngClass]="(m.estado === 'EN_PAGO' || m.estado === 'ESPERANDO_PAGO') ? 'btn-warning' : 'btn-danger-glass'" routerLink="/mozo/cuenta">
                {{ (m.estado === 'EN_PAGO' || m.estado === 'ESPERANDO_PAGO') ? 'Cobrar' : 'Cerrar' }}
              </button>
            </div>

            <!-- Atendido por otro mozo -->
            <div class="mpc-lock-msg" *ngIf="(m.estado === 'OCUPADA' || m.estado === 'EN_PAGO' || m.estado === 'ESPERANDO_PAGO') && m.idMozoAsignado && !m.atendidaPorMi">
               Atendido por: <span style="color: #4f46e5">{{ m.nombreMozoAsignado || 'Staff' }}</span>
            </div>
          </div>
        </div>
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
    
    .salit-legend { display: flex; gap: 1rem; background: #f8fafc; padding: 0.5rem 1rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #64748b; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.disp { background: #10b981; }
    .dot.ocup { background: #ef4444; }
    .dot.mia { background: #4f46e5; }
    .dot.pago { background: #f59e0b; }

    .mesas-enterprise-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
      gap: 1.5rem; 
      margin-top: 2rem; 
    }

    .mesa-premium-card {
      background: white; border-radius: 24px; padding: 1.5rem;
      border: 1px solid #f1f5f9; position: relative; overflow: hidden;
      display: flex; flex-direction: column; min-height: 280px;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01);
    }

    .mesa-premium-card:hover { transform: translateY(-8px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); border-color: #e2e8f0; }

    /* Badges & Indicators */
    .mpc-badge { position: absolute; top: 0; right: 2rem; background: #4f46e5; color: white; padding: 0.25rem 0.75rem; font-size: 0.6rem; font-weight: 950; border-radius: 0 0 8px 8px; letter-spacing: 0.05em; z-index: 5; }
    
    .mpc-ready-indicator { position: absolute; top: 1.5rem; right: 1.5rem; z-index: 10; }
    .bell-ring { font-size: 1.5rem; animation: bell-shake 0.5s infinite alternate; }
    @keyframes bell-shake { 0% { transform: rotate(-15deg); } 100% { transform: rotate(15deg); } }

    .mpc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .mpc-number { font-family: 'Outfit'; font-weight: 900; font-size: 1.75rem; color: #0f172a; }
    
    .mpc-state-indicator { display: flex; align-items: center; gap: 0.4rem; padding: 0.25rem 0.6rem; background: #f1f5f9; border-radius: 8px; }
    .state-dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }
    .state-text { font-size: 0.65rem; font-weight: 850; text-transform: uppercase; color: #475569; }

    .mpc-body { flex: 1; }
    .mpc-main-stat { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .mpc-capacity { display: flex; align-items: center; gap: 0.4rem; font-size: 1rem; font-weight: 800; color: #64748b; font-family: 'Outfit'; }
    .mpc-role-icon { width: 50px; height: 50px; border-radius: 14px; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #cbd5e1; }

    .mpc-details { min-height: 60px; }
    .mpc-mozo-line { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.75rem; }
    .mozo-avatar { width: 24px; height: 24px; background: #4f46e5; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 900; }
    .mozo-name { font-size: 0.8rem; font-weight: 700; color: #334155; }
    
    .mpc-order-status { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.7rem; font-weight: 850; text-transform: uppercase; }
    .os-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    
    .os-pendiente { background: #eff6ff; color: #2563eb; }
    .os-preparando { background: #fffbeb; color: #d97706; }
    .os-listo { background: #ecfdf5; color: #10b981; animation: bg-glow 2s infinite; }
    .os-en_pago { background: #fff7ed; color: #f59e0b; }
    @keyframes bg-glow { 0%, 100% { box-shadow: 0 0 0 rgba(16, 185, 129, 0); } 50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); } }

    .mpc-empty-info { font-size: 0.85rem; font-weight: 500; color: #94a3b8; font-style: italic; }

    .mpc-actions { margin-top: 1.5rem; }
    .mpc-btn { width: 100%; border: none; padding: 0.8rem; border-radius: 12px; font-weight: 850; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-family: 'Inter'; }
    
    .mpc-btn-group { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    
    .btn-primary-glass { background: #1e293b; color: white; }
    .btn-indigo { background: #4f46e5; color: white; }
    .btn-danger-glass { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }
    .btn-warning { background: #f59e0b; color: white; }
    
    .mpc-btn:hover { filter: brightness(1.2); transform: translateY(-2px); }

    .mpc-lock-msg { padding: 0.8rem; background: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 12px; text-align: center; font-size: 0.8rem; font-weight: 700; color: #94a3b8; }

    /* Dynamic Status Styles */
    .status-disponible { border-top: 4px solid #10b981; }
    .status-disponible .state-dot { background: #10b981; box-shadow: 0 0 8px #10b981; }
    .status-disponible .mpc-role-icon { color: #10b981; background: #ecfdf5; }
    
    .status-ocupada { border-top: 4px solid #ef4444; }
    .status-ocupada .state-dot { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
    .status-ocupada .mpc-role-icon { color: #ef4444; background: #fef2f2; }

    .status-en_pago { border-top: 4px solid #f59e0b; }
    .status-en_pago .state-dot { background: #f59e0b; box-shadow: 0 0 8px #f59e0b; }
    .status-en_pago .mpc-role-icon { color: #f59e0b; background: #fff7ed; }
    
    .is-owner { border-color: #4f46e5; box-shadow: 0 10px 30px rgba(79, 70, 229, 0.1); border-top-width: 4px !important; }
    .is-owner.status-en_pago { border-color: #f59e0b !important; }
    .is-owner.status-en_pago .state-dot { background: #f59e0b !important; box-shadow: 0 0 8px #f59e0b !important; }
    .is-owner .state-dot { background: #4f46e5 !important; box-shadow: 0 0 8px #4f46e5 !important; }
    .is-owner .mpc-role-icon { color: #4f46e5 !important; background: #eef2ff !important; }
  `]

})
export class MozoMesaListComponent implements OnInit, OnDestroy {
  private mesaService = inject(MesaService);
  private authService = inject(AuthService);
  private wsService = inject(WsService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  
  mesas = signal<any[]>([]);

  ngOnInit() {
    this.cargarMesas();
    this.initWs();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initWs() {
    this.wsService.connect();
    
    // Recargar mesas cuando cambie un estado de pedido o mesa
    this.wsService.subscribe('/topic/mesas').pipe(takeUntil(this.destroy$)).subscribe(() => this.cargarMesas());
    this.wsService.subscribe('/topic/pedidos/estado').pipe(takeUntil(this.destroy$)).subscribe(() => this.cargarMesas());
    this.wsService.subscribe('/topic/mozo/pedido-listo').pipe(takeUntil(this.destroy$)).subscribe(() => this.cargarMesas());
  }

  cargarMesas() {
    this.mesaService.getAll().subscribe({
      next: (res) => {
        const user = this.authService.currentUser();
        const userId = user?.idUsuario;
        
        const refinedMesas = res.map(m => {
          // Usamos directamente el valor 'atendidaPorMi' que ya viene calculado del backend
          return { ...m };
        });
        
        this.mesas.set(refinedMesas);
      },
      error: (err) => console.error("[MOZO][MesaList] Error al cargar mesas:", err)
    });
  }

  atenderMesa(id: number) {
    this.mesaService.atenderMesa(id).subscribe({
      next: () => {
        // Redireccionar inmediatamente al POS para hacer el pedido
        this.router.navigate(['/mozo/tomar-pedido', id]);
      },
      error: (err) => console.error("[MOZO][MesaList] Error al ocupar mesa:", err)
    });
  }
}
