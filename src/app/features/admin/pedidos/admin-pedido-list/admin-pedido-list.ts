import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../../core/services/pedido.service';
import { WsService } from '../../../../core/services/ws.service';
import { PedidoDTO } from '../../../../core/models/pedido.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';

@Component({
    selector: 'app-admin-pedido-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, ModalComponent, KpiCardComponent],
    templateUrl: './admin-pedido-list.html',
    styleUrl: './admin-pedido-list.css'
})
export class AdminPedidoList implements OnInit {
    private pedidoService = inject(PedidoService);
    private wsService = inject(WsService);
    private toastService = inject(ToastService);

    searchQuery = signal('');
    filtroEstado = signal('');
    pedidos = signal<PedidoDTO[]>([]);

    // Detail Modal State
    showModal = signal(false);
    selectedPedido = signal<PedidoDTO | null>(null);

    // Pagination State
    pageSize = signal(10);
    currentPage = signal(1);

    Math = Math;

    ngOnInit() {
        console.log("[ADMIN][PedidoList] Inicializando componente de listado de pedidos...");
        this.cargar();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wsService.subscribe('/topic/pedidos/estado').subscribe({
            next: () => this.cargar()
        });
        this.wsService.subscribe('/topic/mesas').subscribe({
            next: () => this.cargar()
        });
    }

    cargar() {
        console.log("[ADMIN][PedidoList][cargar] Solicitando búsqueda de pedidos para administración...");
        // Por ahora sin filtros de fecha para el listado general
        this.pedidoService.searchAdmin({}).subscribe({
            next: (res) => {
                console.log("[ADMIN][PedidoList][cargar] Pedidos cargados exitosamente:", res.length);
                this.pedidos.set(res);
            },
            error: (err) => {
                console.error("[ADMIN][PedidoList][cargar] Error CRÍTICO al cargar pedidos:", err);
                // Evitar spam de errores si ya hay uno visible o si es el primer fallo
                if (this.pedidos().length === 0) {
                    this.toastService.error("No se pudieron conectar los datos de pedidos con el servidor");
                }
            }
        });
    }

    filtrados = computed(() => {
        const q = this.searchQuery().toLowerCase();
        const f = this.filtroEstado();
        return this.pedidos().filter(p => {
            const matchSearch = p.idPedido?.toString().includes(q) || p.numeroMesa?.toString().includes(q);
            const matchFiltro = f === '' || p.estado === f;
            return matchSearch && matchFiltro;
        });
    });

    paginatedPedidos = computed(() => {
        const _filtrados = this.filtrados();
        const start = (this.currentPage() - 1) * this.pageSize();
        return _filtrados.slice(start, start + this.pageSize());
    });

    totalPages = computed(() => {
        return Math.ceil(this.filtrados().length / this.pageSize());
    });

    nextPage() {
        if (this.currentPage() < this.totalPages()) {
            this.currentPage.update(p => p + 1);
        }
    }

    prevPage() {
        if (this.currentPage() > 1) {
            this.currentPage.update(p => p - 1);
        }
    }

    onPageSizeChange(event: any) {
        this.pageSize.set(Number(event.target.value));
        this.currentPage.set(1);
    }

    onSearchChange(value: string) {
        this.searchQuery.set(value);
        this.currentPage.set(1);
    }

    onFilterChange(estado: string) {
        this.filtroEstado.set(estado);
        this.currentPage.set(1);
    }

    stats = computed(() => {
        const all = this.pedidos();
        // Usar fecha local para evitar desfase de zona horaria (UTC)
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();
        
        const todayPedidos = all.filter(p => {
            if (!p.fechaPedido) return false;
            const pDate = new Date(p.fechaPedido);
            return pDate.getFullYear() === year && 
                   pDate.getMonth() === month && 
                   pDate.getDate() === day;
        });

        const estadosDeVenta = ['PAGADO', 'EN_PAGO'];

        return {
            activos: all.filter(p => p.estado && !['PAGADO', 'CANCELADO'].includes(p.estado)).length,
            pagados: todayPedidos.filter(p => p.estado && estadosDeVenta.includes(p.estado)).length,
            totalVentas: todayPedidos.filter(p => p.estado && estadosDeVenta.includes(p.estado))
                           .reduce((acc, p) => acc + (p.total || 0), 0).toFixed(2),
            cancelados: todayPedidos.filter(p => p.estado === 'CANCELADO').length
        };
    });

    getBadgeClass(estado: string): string {
        switch (estado) {
            case 'PENDIENTE': return 'badge-pendiente';
            case 'PREPARANDO': return 'badge-preparando';
            case 'LISTO': return 'badge-listo';
            case 'SERVIDO': return 'badge-servido';
            case 'PAGADO': return 'badge-pagado';
            case 'CANCELADO': return 'badge-cancelado';
            default: return '';
        }
    }

    verDetalle(p: PedidoDTO) {
        this.selectedPedido.set(p);
        this.showModal.set(true);
    }

    cerrarDetalle() {
        this.showModal.set(false);
        this.selectedPedido.set(null);
    }

    confirmarPago(pedido: PedidoDTO) {
        if (!pedido || !pedido.idPedido) return;

        const metodo = prompt("Ingrese método de pago (EFECTIVO, TARJETA, YAPE, PLIN):", "EFECTIVO");
        if (!metodo) return;

        this.pedidoService.confirmarPago(pedido.idPedido, metodo.toUpperCase()).subscribe({
            next: () => {
                this.toastService.success("Pago confirmado exitosamente");
                this.cerrarDetalle();
                this.cargar();
            },
            error: (err) => {
                console.error("Error al confirmar pago:", err);
                this.toastService.error("No se pudo confirmar el pago");
            }
        });
    }
}
