import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventarioService } from '../../../../core/services/inventario.service';
import { Inventario } from '../../../../core/models/inventario.model';
import { ToastService } from '../../../../core/services/toast.service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';

@Component({
    selector: 'app-inventario-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent, EmptyStateComponent, KpiCardComponent],
    templateUrl: './inventario-list.html',
    styleUrl: './inventario-list.css'
})
export class InventarioList implements OnInit {
    private inventarioService = inject(InventarioService);
    private toastService = inject(ToastService);

    searchTerm = signal('');
    filtroEstado = signal('');
    insumos = signal<Inventario[]>([]);

    // Pagination State
    pageSize = signal(10);
    currentPage = signal(1);
    Math = Math;

    // Modal State
    showInvModal = signal(false);
    modalMode = signal<'entrada' | 'salida' | 'nuevo'>('nuevo');
    selectedItem = signal<Inventario | null>(null);
    modalCantidad = 0;
    modalNombre = '';
    modalUnidad = 'KG';
    modalMinimo = 5;
    modalPrecio = 0;

    showHistorial = false;
    historial = signal<any[]>([]);
    cargandoHistorial = false;

    ngOnInit() {
        console.log("[ADMIN][InventarioList] Inicializando componente de inventario...");
        this.cargar();
    }

    cargar() {
        console.log("[ADMIN][InventarioList][cargar] Solicitando carga de insumos de inventario...");
        this.inventarioService.getAll().subscribe({
            next: (res) => {
                console.log("[ADMIN][InventarioList][cargar] Insumos cargados exitosamente:", res.length);
                this.insumos.set(res);
            },
            error: (err) => {
                console.error("[ADMIN][InventarioList][cargar] Error al cargar inventario:", err);
                this.toastService.error("No se pudo cargar el inventario");
            }
        });
    }

    filtrados = computed(() => {
        return this.insumos().filter(i => {
            const ms = !this.searchTerm() || i.nombreInsumo.toLowerCase().includes(this.searchTerm().toLowerCase());

            let itemEstado = 'OK';
            if (i.cantidadActual <= 0) itemEstado = 'EMPTY';
            else if (i.cantidadActual <= i.stockMinimo) itemEstado = 'LOW';

            const me = !this.filtroEstado() || itemEstado === this.filtroEstado();
            return ms && me;
        });
    });

    paginatedInsumos = computed(() => {
        const list = this.filtrados();
        const start = (this.currentPage() - 1) * this.pageSize();
        return list.slice(start, start + this.pageSize());
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

    onSearchChange(val: string) {
        this.searchTerm.set(val);
        this.currentPage.set(1);
    }

    onEstadoChange(val: string) {
        this.filtroEstado.set(val);
        this.currentPage.set(1);
    }

    stats = computed(() => {
        const list = this.insumos();
        return {
            total: list.length,
            ok: list.filter(i => i.cantidadActual > i.stockMinimo).length,
            low: list.filter(i => i.cantidadActual > 0 && i.cantidadActual <= i.stockMinimo).length,
            empty: list.filter(i => i.cantidadActual <= 0).length,
        };
    });

    getStockPct(item: Inventario): number {
        if (item.stockMinimo === 0) return 100;
        const max = item.stockMinimo * 3;
        return Math.min(Math.round((item.cantidadActual / max) * 100), 100);
    }

    getEstadoClass(item: Inventario) {
        if (item.cantidadActual <= 0) return 'badge-red';
        if (item.cantidadActual <= item.stockMinimo) return 'badge-yellow';
        return 'badge-green';
    }

    getEstadoLabel(item: Inventario) {
        if (item.cantidadActual <= 0) return '✕ Sin Stock';
        if (item.cantidadActual <= item.stockMinimo) return '⚠ Bajo';
        return '✔ OK';
    }

    getBarClass(item: Inventario) {
        if (item.cantidadActual <= 0) return 'fill-empty';
        if (item.cantidadActual <= item.stockMinimo) return 'fill-low';
        return 'fill-ok';
    }

    openEntrada(item: Inventario) {
        this.selectedItem.set(item);
        this.modalCantidad = 0;
        this.modalMode.set('entrada');
        this.showInvModal.set(true);
    }
    openSalida(item: Inventario) {
        this.selectedItem.set(item);
        this.modalCantidad = 0;
        this.modalMode.set('salida');
        this.showInvModal.set(true);
    }
    openNuevo() {
        this.modalMode.set('nuevo');
        this.modalNombre = '';
        this.modalPrecio = 0;
        this.modalMinimo = 5;
        this.showInvModal.set(true);
    }
    closeModal() { this.showInvModal.set(false); this.selectedItem.set(null); }

    openHistorial() {
        this.showHistorial = true;
        this.cargarHistorial();
    }

    closeHistorial() { this.showHistorial = false; }

    cargarHistorial() {
        this.cargandoHistorial = true;
        console.log("[ADMIN][InventarioList] Cargando historial de movimientos...");
        this.inventarioService.getHistorial().subscribe({
            next: (data) => {
                this.historial.set(data);
                this.cargandoHistorial = false;
            },
            error: (err) => {
                console.error("[ADMIN][InventarioList] Error al cargar historial:", err);
                this.toastService.error("No se pudo cargar el historial");
                this.cargandoHistorial = false;
            }
        });
    }

    confirmar() {
        try {
            const item = this.selectedItem();
            if (this.modalMode() === 'entrada' && item) {
                console.log(`[ADMIN][InventarioList][confirmar] Registrando ENTRADA para ID ${item.idInventario}: ${this.modalCantidad} unidades`);
                this.inventarioService.registrarEntrada({
                    idInventario: item.idInventario!,
                    cantidad: this.modalCantidad,
                    observacion: 'Entrada manual desde Admin'
                }).subscribe({
                    next: () => {
                        console.log("[ADMIN][InventarioList][confirmar] Entrada registrada con éxito");
                        this.toastService.success('Entrada registrada');
                        this.cargar();
                        this.closeModal();
                    },
                    error: (err) => {
                        console.error("[ADMIN][InventarioList][confirmar] Error al registrar entrada:", err);
                        this.toastService.error('Error al registrar entrada');
                    }
                });
            } else if (this.modalMode() === 'salida' && item) {
                console.log(`[ADMIN][InventarioList][confirmar] Registrando SALIDA para ID ${item.idInventario}: ${this.modalCantidad} unidades`);
                this.inventarioService.registrarSalida({
                    idInventario: item.idInventario!,
                    cantidad: this.modalCantidad,
                    observacion: 'Salida manual desde Admin'
                }).subscribe({
                    next: () => {
                        console.log("[ADMIN][InventarioList][confirmar] Salida registrada con éxito");
                        this.toastService.success('Salida registrada');
                        this.cargar();
                        this.closeModal();
                    },
                    error: (err) => {
                        console.error("[ADMIN][InventarioList][confirmar] Error al registrar salida:", err);
                        this.toastService.error('Error al registrar salida');
                    }
                });
            } else if (this.modalMode() === 'nuevo') {
                const nuevo: any = {
                    nombreInsumo: this.modalNombre,
                    unidadMedida: this.modalUnidad,
                    cantidadActual: 0,
                    stockMinimo: this.modalMinimo
                };
                console.log("[ADMIN][InventarioList][confirmar] Creando nuevo insumo:", nuevo);
                this.inventarioService.create(nuevo).subscribe({
                    next: (res) => {
                        console.log("[ADMIN][InventarioList][confirmar] Insumo creado con éxito:", res);
                        this.toastService.success('Insumo creado');
                        this.cargar();
                        this.closeModal();
                    },
                    error: (err) => {
                        console.error("[ADMIN][InventarioList][confirmar] Error al crear insumo:", err);
                        this.toastService.error('Error al crear insumo');
                    }
                });
            }
        } catch (error) {
            console.error("[ADMIN][InventarioList][confirmar] Error crítico inesperado:", error);
            this.toastService.error("Ocurrió un error inesperado al procesar la operación");
        }
    }
}
