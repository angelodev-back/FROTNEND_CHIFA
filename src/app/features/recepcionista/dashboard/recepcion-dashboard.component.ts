import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MesaDTO } from '../../../core/models/mesa.model';
import { MesaService } from '../../../core/services/mesa.service';
import { ReservaDTO, ReservaService } from '../../../core/services/reserva.service';
import { forkJoin } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-recepcion-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent],
  template: `
    <div class="admin-page anime-fade-in">
      
      <!-- Premium Header -->
      <div class="admin-page-header mb-8">
        <div class="aph-left">
          <div class="aph-icon" style="background: linear-gradient(135deg, #6366f1, #a855f7);">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </div>
          <div>
            <h1 class="aph-title" style="font-size: 3.5rem !important;">Panel de Recepción</h1>
          </div>
        </div>
        <div class="aph-right">
          <button class="btn btn-primary shadow-lg shadow-indigo-500/20" routerLink="/recepcion/reservas/nuevo">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nueva Reserva
          </button>
        </div>
      </div>

      <!-- KPI Grid (Horizontal) -->
      <div class="kpis-grid mb-8">
        <app-kpi-card 
          titulo="Mesas Libres" 
          [valor]="stats().mesasDisponibles" 
          icono="mesas" 
          color="green" 
          tendencia="up"
          tendenciaLabel="Listas para usar">
        </app-kpi-card>

        <app-kpi-card 
          titulo="Reservas Hoy" 
          [valor]="stats().reservasHoy" 
          icono="pedidos" 
          color="blue" 
          tendencia="neutral"
          tendenciaLabel="Total del día">
        </app-kpi-card>

        <app-kpi-card 
          titulo="Mesas Ocupadas" 
          [valor]="stats().mesasOcupadas" 
          icono="clientes" 
          color="orange" 
          tendencia="neutral"
          tendenciaLabel="En servicio">
        </app-kpi-card>

        <app-kpi-card 
          titulo="Pendientes" 
          [valor]="stats().pendientesConfirmar" 
          icono="rating" 
          color="purple" 
          tendencia="down"
          tendenciaLabel="Por confirmar">
        </app-kpi-card>
      </div>

      <div class="dashboard-grid">
        <!-- Próximas Reservas -->
        <div class="premium-card">
          <div class="pc-header">
            <h3 class="pc-title">Próximas Llegadas</h3>
            <a routerLink="/recepcion/reservas" class="pc-link">Ver todas</a>
          </div>
          <div class="pc-body p-0">
            <div class="empty-state py-12" *ngIf="proximasReservas().length === 0">
               <div class="text-4xl mb-3">📅</div>
               <p class="text-slate-400 font-bold">No hay llegadas programadas.</p>
            </div>
            
            <div class="modern-list" *ngIf="proximasReservas().length > 0">
              <div class="ml-item" *ngFor="let r of proximasReservas()">
                <div class="ml-time">{{ formatTime(r.fechaHoraReserva) }}</div>
                <div class="ml-info">
                  <div class="ml-primary">{{ r.nombreCliente || 'Cliente Anónimo' }}</div>
                  <div class="ml-secondary">{{ r.cantidadPersonas }} pers · Mesa {{ r.numeroMesa }}</div>
                </div>
                <span class="ml-badge" [ngClass]="'badge-' + r.estado?.toLowerCase()">{{ r.estado }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de Mesas Rápido -->
        <div class="premium-card">
          <div class="pc-header">
            <h3 class="pc-title">Mapa Rápido</h3>
            <a routerLink="/recepcion/mesas" class="pc-link">Ir a plano</a>
          </div>
          <div class="pc-body">
            <div class="mini-grid-mesas">
              <div class="mini-mesa" *ngFor="let m of mesas()" [ngClass]="m.estado.toLowerCase()">
                <div class="m-num">{{ m.numeroMesa || m.numero }}</div>
                <div class="m-dot"></div>
              </div>
            </div>

            <div class="mini-legend mt-6">
               <div class="ml-item"><span class="dot disp"></span> Disponible</div>
               <div class="ml-item"><span class="dot ocup"></span> Ocupada</div>
               <div class="ml-item"><span class="dot reser"></span> Reservada</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page { 
      padding: 3rem 4rem; 
      max-width: 100%; 
      margin: 0; 
      background-color: var(--color-bg);
    }
    
    .admin-page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 2.5rem !important;
      background: var(--color-surface);
      padding: 1.5rem 2rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
      box-shadow: var(--shadow-md);
    }

    .aph-left { display: flex; align-items: center; gap: 1.5rem; }
    
    .aph-title {
      font-size: 2.5rem !important;
      font-weight: 950;
      letter-spacing: -0.04em;
      color: var(--color-text);
      line-height: 1;
      margin: 0;
    }

    .aph-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 8px 16px rgba(99, 102, 241, 0.25);
    }

    .dashboard-grid { 
      display: grid; 
      grid-template-columns: 1.6fr 1.4fr; 
      gap: 2rem; 
      margin-top: 1rem; 
    }
    
    .kpis-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); 
      gap: 2rem; 
      margin-bottom: 3rem; 
    }
    
    /* Premium Card Design */
    .premium-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border-light);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: var(--transition-spring);
    }
    .premium-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }

    .pc-header { 
      padding: 1.5rem 2rem; 
      border-bottom: 1px solid var(--color-border-light); 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
    }
    .pc-title { 
      font-size: 1.25rem; 
      font-weight: 900; 
      color: var(--color-text); 
      font-family: 'Outfit'; 
      margin: 0; 
    }
    .pc-link { 
      font-size: 0.75rem; 
      font-weight: 850; 
      color: var(--color-primary); 
      text-decoration: none; 
      padding: 0.45rem 1rem; 
      background: var(--color-primary-bg); 
      border-radius: var(--radius-full); 
      transition: var(--transition-fast); 
    }
    .pc-link:hover { filter: brightness(0.95); }

    .pc-body { padding: 2rem; flex: 1; }

    /* Modern List Styling */
    .modern-list { display: flex; flex-direction: column; }
    .ml-item { 
      display: flex; 
      align-items: center; 
      padding: 1.5rem 2rem; 
      border-bottom: 1px dashed var(--color-border-light); 
      gap: 1.5rem; 
      transition: var(--transition-fast); 
    }
    .ml-item:hover { background: var(--color-bg-alt); }
    .ml-item:last-child { border-bottom: none; }
    
    .ml-time { 
      font-weight: 900; 
      color: var(--color-primary); 
      background: var(--color-primary-bg); 
      padding: 0.5rem 0.85rem; 
      border-radius: var(--radius-sm); 
      font-size: 0.9rem; 
      min-width: 80px; 
      text-align: center; 
      font-family: 'Outfit'; 
      border: 1px solid var(--color-primary); 
    }
    .ml-info { flex: 1; }
    .ml-primary { font-weight: 900; color: var(--color-text); font-size: 1.1rem; font-family: 'Outfit'; }
    .ml-secondary { font-size: 0.85rem; color: var(--color-text-muted); margin-top: 0.25rem; font-weight: 700; }
    
    .ml-badge { 
      padding: 0.4rem 0.85rem; 
      border-radius: var(--radius-full); 
      font-size: 0.65rem; 
      font-weight: 900; 
      text-transform: uppercase; 
      letter-spacing: 0.05em; 
    }
    .badge-confirmada { background: var(--color-success-bg); color: var(--color-success); border: 1px solid var(--color-success); }
    .badge-pendiente { background: var(--color-warning-bg); color: var(--color-warning); border: 1px solid var(--color-warning); }
    
    /* Mini Grid Mesas */
    .mini-grid-mesas { display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 1rem; }
    .mini-mesa { 
      aspect-ratio: 1; 
      border-radius: var(--radius-md); 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      position: relative; 
      transition: var(--transition-spring); 
      border: 1.5px solid var(--color-border-light); 
      background: var(--color-surface); 
      box-shadow: var(--shadow-sm); 
    }
    .mini-mesa:hover { transform: scale(1.1) rotate(2deg); z-index: 5; box-shadow: var(--shadow-md); }
    
    .mini-mesa.disponible { background: var(--color-success-bg); color: var(--color-success); border-color: var(--color-success); }
    .mini-mesa.reservada  { background: var(--color-warning-bg); color: var(--color-warning); border-color: var(--color-warning); }
    .mini-mesa.ocupada    { background: var(--color-info-bg); color: var(--color-info); border-color: var(--color-info); }
    
    .m-num { font-weight: 950; font-size: 1.25rem; font-family: 'Outfit'; }
    .m-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; margin-top: 0.25rem; opacity: 0.4; }
    
    /* Legend */
    .mini-legend { 
      display: flex; 
      gap: 1.5rem; 
      padding: 1.25rem; 
      background: var(--color-bg-alt); 
      border-radius: var(--radius-md); 
      border: 1px solid var(--color-border-light); 
      justify-content: center; 
      margin-top: 2rem;
    }
    .mini-legend .ml-item { 
      display: flex; 
      align-items: center; 
      gap: 0.6rem; 
      font-size: 0.75rem; 
      font-weight: 850; 
      color: var(--color-text-muted); 
      padding: 0; 
      border: none; 
      background: transparent; 
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .dot { width: 10px; height: 10px; border-radius: 3px; }
    .dot.disp { background: var(--color-success); }
    .dot.ocup { background: var(--color-info); }
    .dot.reser { background: var(--color-warning); }

    @media (max-width: 1280px) { 
      .dashboard-grid { grid-template-columns: 1fr; } 
      .recepcionista-dashboard { padding: 1.5rem; }
      .admin-page-header { flex-direction: column; align-items: stretch; gap: 1.5rem; }
    }

  `]
})
export class RecepcionDashboardComponent implements OnInit {
  private mesaService = inject(MesaService);
  private reservaService = inject(ReservaService);

  mesas = signal<MesaDTO[]>([]);
  reservas = signal<ReservaDTO[]>([]);
  proximasReservas = signal<ReservaDTO[]>([]);
  stats = signal({
    mesasDisponibles: 0,
    reservasHoy: 0,
    mesasOcupadas: 0,
    pendientesConfirmar: 0
  });

  ngOnInit() {
    console.log("[RECEPCION][Dashboard] Inicializando panel de recepción...");
    forkJoin({
      mesas: this.mesaService.getAll(),
      reservas: this.reservaService.listarTodas()
    }).subscribe({
      next: (res) => {
        console.log("[RECEPCION][Dashboard] Datos cargados exitosamente. Mesas:", res.mesas.length, "Reservas:", res.reservas.length);
        this.mesas.set(res.mesas);
        this.reservas.set(res.reservas);

        this.proximasReservas.set(res.reservas
          .filter(r => r.estado !== 'CANCELADA' && r.estado !== 'COMPLETADA')
          .slice(0, 5));

        this.stats.set({
          mesasDisponibles: res.mesas.filter(m => m.estado === 'DISPONIBLE').length,
          reservasHoy: res.reservas.length,
          mesasOcupadas: res.mesas.filter(m => m.estado === 'OCUPADA').length,
          pendientesConfirmar: res.reservas.filter(r => r.estado === 'PENDIENTE').length
        });
      },
      error: (err) => {
        console.error("[RECEPCION][Dashboard] Error al cargar datos del panel:", err);
      }
    });
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '--:--';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  }
}
