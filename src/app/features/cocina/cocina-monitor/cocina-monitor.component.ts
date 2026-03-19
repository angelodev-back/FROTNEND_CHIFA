import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../../core/services/pedido.service';
import { WsService } from '../../../core/services/ws.service';
import { ToastService } from '../../../core/services/toast.service';
import { PedidoDTO, DetallePedidoDTO } from '../../../core/models/pedido.model';
import { Subject, interval } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-cocina-monitor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cocina-monitor.component.html',
  styleUrl: './cocina-monitor.component.css'
})
export class CocinaMonitorComponent implements OnInit, OnDestroy {
  private pedidoService = inject(PedidoService);
  private wsService = inject(WsService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  allPedidos = signal<PedidoDTO[]>([]);
  horaActual = signal(new Date().toLocaleTimeString('es-PE'));

  // Splash Feedback
  showSplash = signal(false);
  splashMessage = signal('');

  pendientes = signal<PedidoDTO[]>([]);
  enPreparacion = signal<PedidoDTO[]>([]);
  listos = signal<PedidoDTO[]>([]);

  ngOnInit() {
    console.log("[COCINA][Monitor] Inicializando monitor de cocina (KDS)...");
    this.cargarPedidos();
    this.initWs();
    interval(1000).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.horaActual.set(new Date().toLocaleTimeString('es-PE'));
    });
  }

  ngOnDestroy() {
    console.log("[COCINA][Monitor] Destruyendo componente monitor...");
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarPedidos() {
    console.log("[COCINA][Monitor][cargarPedidos] Solicitando pedidos para cocina...");
    this.pedidoService.getPedidosCocina().subscribe({
      next: (data) => {
        console.log("[COCINA][Monitor][cargarPedidos] Pedidos cargados exitosamente:", data.length);
        this.allPedidos.set(data);
        this.actualizarColumnas();
      },
      error: (err) => {
        console.error("[COCINA][Monitor][cargarPedidos] Error al cargar pedidos de cocina:", err);
      }
    });
  }

  actualizarColumnas() {
    try {
      const list = this.allPedidos();
      this.pendientes.set(list.filter(p => p.estado === 'PENDIENTE'));
      this.enPreparacion.set(list.filter(p => p.estado === 'PREPARANDO' || p.estado === 'EN_PREPARACION'));
      this.listos.set(list.filter(p => p.estado === 'LISTO'));
    } catch (error) {
      console.error("[COCINA][Monitor][actualizarColumnas] Error al filtrar pedidos por columnas:", error);
    }
  }

  initWs() {
    try {
      console.log("[COCINA][Monitor][initWs] Configurando suscripciones WebSocket...");
      this.wsService.connect();
      this.wsService.subscribe('/topic/cocina/nuevo-pedido').pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          console.log("[COCINA][WS] Nuevo pedido detectado, recargando...");
          this.cargarPedidos();
        },
        error: (err) => console.error("[COCINA][WS] Error en suscripción nuevo-pedido:", err)
      });

      this.wsService.subscribe('/topic/pedidos/estado').pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          console.log("[COCINA][WS] Cambio de estado detectado, recargando...");
          this.cargarPedidos();
        },
        error: (err) => console.error("[COCINA][WS] Error en suscripción estado-pedidos:", err)
      });
    } catch (wsError) {
      console.error("[COCINA][Monitor][initWs] Error crítico configurando WebSockets:", wsError);
    }
  }

  iniciarPreparacion(p: PedidoDTO) {
    try {
      console.log(`[COCINA][Monitor][iniciarPreparacion] Iniciando preparación de pedido ID: ${p.idPedido}...`);
      this.pedidoService.cambiarEstado(p.idPedido!, 'PREPARANDO').subscribe({
        next: () => {
          console.log(`[COCINA][Monitor][iniciarPreparacion] Pedido ID ${p.idPedido} marcado en preparación`);
          this.triggerSplash(`¡PEDIDO #${p.idPedido} EN PREPARACIÓN!`);
          this.cargarPedidos();
        },
        error: (err) => {
          console.error(`[COCINA][Monitor][iniciarPreparacion] Error al iniciar pedido ID ${p.idPedido}:`, err);
          this.toastService.error("Error al iniciar preparación");
        }
      });
    } catch (error) {
      console.error("[COCINA][Monitor][iniciarPreparacion] Error inesperado:", error);
    }
  }

  marcarDetalle(d: DetallePedidoDTO, estado: string) {
    try {
      console.log(`[COCINA][Monitor][marcarDetalle] Cambiando detalle ID ${d.idDetalle} a estado: ${estado}`);
      this.pedidoService.updateDetalleEstado(d.idDetalle!, estado).subscribe({
        next: () => {
          console.log(`[COCINA][Monitor][marcarDetalle] Detalle ID ${d.idDetalle} actualizado con éxito`);
          this.cargarPedidos();
        },
        error: (err) => {
          console.error(`[COCINA][Monitor][marcarDetalle] Error en detalle ID ${d.idDetalle}:`, err);
        }
      });
    } catch (error) {
      console.error("[COCINA][Monitor][marcarDetalle] Error inesperado:", error);
    }
  }

  finalizarPedido(p: PedidoDTO) {
    try {
      console.log(`[COCINA][Monitor][finalizarPedido] Finalizando pedido ID: ${p.idPedido}...`);
      this.pedidoService.cambiarEstado(p.idPedido!, 'LISTO').subscribe({
        next: () => {
          console.log(`[COCINA][Monitor][finalizarPedido] Pedido ID ${p.idPedido} marcado como LISTO`);
          this.triggerSplash(`¡PEDIDO #${p.idPedido} LISTO!`);
          this.cargarPedidos();
        },
        error: (err) => {
          console.error(`[COCINA][Monitor][finalizarPedido] Error en pedido ID ${p.idPedido}:`, err);
          this.toastService.error("Error al finalizar pedido");
        }
      });
    } catch (error) {
      console.error("[COCINA][Monitor][finalizarPedido] Error inesperado:", error);
    }
  }

  entregar(p: PedidoDTO) {
    try {
      console.log(`[COCINA][Monitor][entregar] Marcando pedido ID ${p.idPedido} como SERVIDO/Entregado...`);
      this.pedidoService.cambiarEstado(p.idPedido!, 'SERVIDO').subscribe({
        next: () => {
          console.log(`[COCINA][Monitor][entregar] Pedido ID ${p.idPedido} entregado con éxito`);
          this.cargarPedidos();
        },
        error: (err) => {
          console.error(`[COCINA][Monitor][entregar] Error al marcar entrega pedido ID ${p.idPedido}:`, err);
        }
      });
    } catch (error) {
      console.error("[COCINA][Monitor][entregar] Error inesperado:", error);
    }
  }

  private triggerSplash(message: string) {
    this.splashMessage.set(message);
    this.showSplash.set(true);
    setTimeout(() => {
      this.showSplash.set(false);
      this.cdr.detectChanges();
    }, 2000);
  }
}
