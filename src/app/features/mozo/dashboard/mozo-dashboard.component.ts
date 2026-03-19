import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MozoService, MozoDashboard } from '../../../core/services/mozo.service';
import { MozoPedidoService } from '../../../core/services/mozo-pedido.service';
import { WsService } from '../../../core/services/ws.service';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-mozo-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent],
  templateUrl: './mozo-dashboard.component.html',
  styleUrl: './mozo-dashboard.component.css'
})
export class MozoDashboardComponent implements OnInit, OnDestroy {
  private mozoService = inject(MozoService);
  private pedidoService = inject(MozoPedidoService);
  private wsService = inject(WsService);
  private destroy$ = new Subject<void>();

  summary = signal<MozoDashboard | null>(null);
  pedidosListos = signal<any[]>([]);
  misPedidos = signal<any[]>([]);

  ngOnInit(): void {
    this.cargarDatos();
    this.initWs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initWs() {
    this.wsService.connect();
    this.wsService.subscribe('/topic/pedidos/estado')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log("[MOZO][Dashboard] Actualización de estado detectada por WS, recargando...");
        this.cargarDatos();
      });
      
    this.wsService.subscribe('/topic/mozo/pedido-listo')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log("[MOZO][Dashboard] ¡Pedido listo detectado via WS!");
        this.cargarDatos();
      });
  }

  cargarDatos() {
    this.mozoService.getDashboard().subscribe(res => this.summary.set(res));
    this.pedidoService.getMisPedidos('LISTO').subscribe(res => this.pedidosListos.set(res));
    
    // Combinar PENDIENTE y PREPARANDO para "Mis Pedidos Activos"
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        pendientes: this.pedidoService.getMisPedidos('PENDIENTE'),
        preparando: this.pedidoService.getMisPedidos('PREPARANDO')
      }).pipe(takeUntil(this.destroy$)).subscribe(({ pendientes, preparando }) => {
        this.misPedidos.set([...pendientes, ...preparando]);
      });
    });
  }
}
