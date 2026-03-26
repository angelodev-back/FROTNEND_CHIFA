import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservaService, ReservaDTO } from '../../../../core/services/reserva.service';
import { WsService } from '../../../../core/services/ws.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-reserva-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reserva-list.html',
  styleUrl: './reserva-list.css'
})
export class AdminReservaList implements OnInit {
  private reservaService = inject(ReservaService);
  private wsService = inject(WsService);
  private toastService = inject(ToastService);

  searchQuery = signal('');
  filtroEstado = signal('');
  reservas = signal<ReservaDTO[]>([]);
  todayStr = new Date().toISOString().split('T')[0];

  // Pagination State
  pageSize = signal(10);
  currentPage = signal(1);

  Math = Math;

  ngOnInit() {
    console.log("[ADMIN][ReservaList] Inicializando componente de gestión de reservas...");
    this.cargar();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wsService.subscribe('/topic/reservas').subscribe({
      next: () => this.cargar()
    });
  }

  cargar() {
    console.log("[ADMIN][ReservaList][cargar] Solicitando carga de todas las reservas...");
    this.reservaService.listarTodas().subscribe({
      next: (res) => {
        console.log("[ADMIN][ReservaList][cargar] Reservas cargadas exitosamente:", res.length);
        this.reservas.set(res);
      },
      error: (err) => {
        console.error("[ADMIN][ReservaList][cargar] Error al cargar reservas:", err);
        this.toastService.error("No se pudieron cargar las reservas");
      }
    });
  }

  reservasFiltradas = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const f = this.filtroEstado();
    return this.reservas().filter(r => {
      const matchSearch = r.nombreCliente?.toLowerCase().includes(q) || r.telefonoCliente?.includes(q);
      const matchFiltro = f === '' || r.estado === f;
      return matchSearch && matchFiltro;
    });
  });

  paginatedReservas = computed(() => {
    const filtered = this.reservasFiltradas();
    const start = (this.currentPage() - 1) * this.pageSize();
    return filtered.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.reservasFiltradas().length / this.pageSize());
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
    this.currentPage.set(1); // Reset to first page
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
    const all = this.reservas();
    return {
      total: all.length,
      confirmadas: all.filter(r => r.estado === 'CONFIRMADA').length,
      pendientes: all.filter(r => r.estado === 'PENDIENTE').length,
      hoy: all.filter(r => r.fechaHoraReserva?.toString().startsWith(this.todayStr)).length
    };
  });

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-pendiente';
      case 'CONFIRMADA': return 'badge-confirmada';
      case 'CANCELADA': return 'badge-cancelada';
      case 'COMPLETADA': return 'badge-completada';
      default: return '';
    }
  }
}
