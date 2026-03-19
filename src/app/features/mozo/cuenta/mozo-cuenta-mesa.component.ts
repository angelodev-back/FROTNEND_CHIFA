import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MozoPedidoService } from '../../../core/services/mozo-pedido.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
   selector: 'app-mozo-cuenta-mesa',
   standalone: true,
   imports: [CommonModule, RouterModule],
   templateUrl: './mozo-cuenta-mesa.component.html',
   styleUrl: './mozo-cuenta-mesa.component.css'
})
export class MozoCuentaMesaComponent implements OnInit {
   private mozoPedidoService = inject(MozoPedidoService);
   private pedidoService = inject(PedidoService);
   private toastService = inject(ToastService);

   mesasConConsumo = signal<any[]>([]);
   pageSize = signal<number>(10);
   searchTerm = signal<string>(''); // For filtering by table number
   mesaSeleccionada = signal<any>(null);
   items = signal<any[]>([]);
   total = signal<number>(0);
   currentDate = new Date();

   // Computed signal with safety checks for null values
   mesasMostradas = computed(() => {
      try {
         let list = this.mesasConConsumo();
         
         // Real-time filter for visual browsing (only if searchTerm is set)
         const term = this.searchTerm().trim().toLowerCase();
         if (term) {
            list = list.filter(m => {
               const numStr = m.numeroMesa?.toString() || '';
               return numStr.includes(term);
            });
         }

         const size = this.pageSize();
         console.log(`[MOZO][CuentaMesa] Mostrando ${list.length} mesas filtradas. PageSize: ${size}`);
         return list.slice(0, size);
      } catch (e) {
         console.error("[MOZO][CuentaMesa] Error en computed signal mesasMostradas:", e);
         return this.mesasConConsumo().slice(0, this.pageSize());
      }
   });
   
   // Group items by nroComanda for displaying initial vs additional orders
   itemsAgrupados = computed(() => {
      const allItems = this.items();
      const groups = new Map<number, any[]>();
      
      allItems.forEach(item => {
         const nro = (item as any).nroComanda || 1;
         if (!groups.has(nro)) groups.set(nro, []);
         groups.get(nro)!.push(item);
      });
      
      return Array.from(groups.entries())
         .sort(([a], [b]) => a - b)
         .map(([nro, items]) => ({ 
            nro, 
            label: nro === 1 ? 'Pedido Inicial' : `Pedido Adicional #${nro - 1}`,
            items 
         }));
   });

   ngOnInit() {
      console.log("[MOZO][CuentaMesa] Inicializando gestión de cuentas y cierres...");
      this.cargarMesasActivas();
   }

   buscarYSeleccionarMesa(term: string) {
      if (!term.trim()) {
         this.toastService.info('Ingresa un número de mesa');
         return;
      }

      const num = parseInt(term.trim());
      if (isNaN(num)) {
         this.toastService.error('Número de mesa inválido');
         return;
      }

      // Update filter to show only that table (or tables containing the number)
      this.searchTerm.set(term.trim());

      console.log(`[MOZO][CuentaMesa][buscarYSeleccionarMesa] Buscando mesa #${num} por backend...`);
      this.mozoPedidoService.getPedidoByMesaNumero(num).subscribe({
         next: (pedido) => {
            if (pedido) {
               console.log("[MOZO][CuentaMesa] Mesa encontrada y seleccionada");
               this.seleccionarMesa(pedido);
            } else {
               this.toastService.error(`No hay pedido activo en la mesa ${num}`);
            }
         },
         error: () => {
            this.toastService.error(`La mesa ${num} no tiene un pedido activo`);
         }
      });
   }

   cambiarPageSize(size: number) {
      console.log(`[MOZO][CuentaMesa] Cambiando vista a ${size} filas`);
      this.pageSize.set(size);
   }

   limpiarBusqueda(inputRef: HTMLInputElement) {
      inputRef.value = '';
      this.searchTerm.set('');
      // No seleccionamos null para que la mesa actual se mantenga visible si el mozo solo quiso limpiar el filtro
   }

   cargarMesasActivas() {
      console.log("[MOZO][CuentaMesa][cargarMesasActivas] Solicitando pedidos mozo para identificar mesas con consumo...");
      this.mozoPedidoService.getMisPedidos().subscribe({
         next: (res) => {
            // Filtrar por mesas únicas con pedidos activos
            const mesas = res.filter((v, i, a) => a.findIndex(t => (t.idMesa === v.idMesa)) === i);
            console.log("[MOZO][CuentaMesa][cargarMesasActivas] Mesas con consumo detectadas:", mesas.length);
            this.mesasConConsumo.set(mesas);
         },
         error: (err) => {
            console.error("[MOZO][CuentaMesa][cargarMesasActivas] Error al cargar pedidos mozo:", err);
         }
      });
   }

   seleccionarMesa(m: any) {
      try {
         console.log(`[MOZO][CuentaMesa][seleccionarMesa] Mesa ${m.numeroMesa} seleccionada. ID Pedido: ${m.idPedido}`);
         this.mesaSeleccionada.set(m);
         this.items.set(m.detalles || []);
         this.total.set(m.total || 0);

         console.log(`[MOZO][CuentaMesa][seleccionarMesa] Solicitando detalle actualizado para pedido ID: ${m.idPedido}...`);
         this.pedidoService.getById(m.idPedido!).subscribe({
            next: (det) => {
               console.log("[MOZO][CuentaMesa][seleccionarMesa] Detalle actualizado recibido");
               this.items.set(det.detalles || []);
               this.total.set(det.total || 0);
            },
            error: (err) => {
               console.error("[MOZO][CuentaMesa][seleccionarMesa] Error al obtener detalle actualizado:", err);
            }
         });
      } catch (error) {
         console.error("[MOZO][CuentaMesa][seleccionarMesa] Error inesperado:", error);
      }
   }

   solicitarPago() {
      try {
         const pedidoId = this.mesaSeleccionada().idPedido;
         console.log(`[MOZO][CuentaMesa][solicitarPago] Poniendo pedido ID: ${pedidoId} en estado EN_PAGO...`);

         this.pedidoService.solicitarPago(pedidoId).subscribe({
            next: () => {
               console.log(`[MOZO][CuentaMesa][solicitarPago] Pedido ${pedidoId} ahora está EN_PAGO`);
               this.toastService.success('Mesa puesta en estado de pago');
               this.mesaSeleccionada.set(null); 
               this.cargarMesasActivas();
            },
            error: (err) => {
               console.error(`[MOZO][CuentaMesa][solicitarPago] Error:`, err);
               this.toastService.error(err.error?.message || 'Error al procesar solicitud');
            }
         });
      } catch (error) {
         console.error("[MOZO][CuentaMesa][solicitarPago] Error crítico:", error);
         this.toastService.error("Ocurrió un error inesperado");
      }
   }

   confirmarPago(metodo: string) {
      try {
         const pedidoId = this.mesaSeleccionada().idPedido;
         console.log(`[MOZO][CuentaMesa][confirmarPago] Confirmando pago para pedido ID: ${pedidoId} con ${metodo}...`);

         this.pedidoService.confirmarPago(pedidoId, metodo).subscribe({
            next: () => {
               this.toastService.success('¡Venta realizada y mesa liberada!');
               this.mesaSeleccionada.set(null);
               this.cargarMesasActivas();
            },
            error: (err) => {
               console.error(`[MOZO][CuentaMesa][confirmarPago] Error:`, err);
               this.toastService.error(err.error?.message || 'Error al confirmar pago');
            }
         });
      } catch (error) {
         console.error("[MOZO][CuentaMesa][confirmarPago] Error crítico:", error);
      }
   }
}
