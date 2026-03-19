import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CajaService, CajaResumenDTO, MovimientoCajaDTO } from '@app/core/services/caja.service';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-admin-caja-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, KpiCardComponent],
  templateUrl: './caja-list.html',
  styleUrl: './caja-list.css'
})
export class AdminCajaList implements OnInit {
  private cajaService = inject(CajaService);

  resumen = signal<CajaResumenDTO | null>(null);
  movimientos = signal<MovimientoCajaDTO[]>([]);

  // Pagination State
  pageSize = signal(10);
  currentPage = signal(1);
  Math = Math;

  ngOnInit() {
    console.log("[ADMIN][CajaList] Inicializando componente de listado de caja...");
    this.cargarDatos();
  }

  cargarDatos() {
    console.log("[ADMIN][CajaList][cargarDatos] Solicitando resumen actual de caja...");
    this.cajaService.getResumen().subscribe({
      next: (res: CajaResumenDTO) => {
        console.log("[ADMIN][CajaList][cargarDatos] Resumen de caja obtenido:", res);
        this.resumen.set(res);
        if (res && res.idCaja) {
          console.log(`[ADMIN][CajaList][cargarDatos] Solicitando movimientos para caja ID: ${res.idCaja}...`);
          this.cajaService.getMovimientos(res.idCaja).subscribe({
            next: (movs: MovimientoCajaDTO[]) => {
              console.log("[ADMIN][CajaList][cargarDatos] Movimientos de caja obtenidos:", movs.length);
              this.movimientos.set(movs);
            },
            error: (err: any) => {
              console.error("[ADMIN][CajaList][cargarDatos] Error:", err);
            }
          });
        }
      },
      error: (err) => {
        console.error("[ADMIN][CajaList][cargarDatos] Error al obtener resumen de caja:", err);
      }
    });
  }

  paginatedMovimientos = computed(() => {
    const all = this.movimientos();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.movimientos().length / this.pageSize());
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

  get totalIngresos() {
    return (this.resumen()?.ingresosEfectivo || 0) +
      (this.resumen()?.ingresosTarjeta || 0) +
      (this.resumen()?.ingresosYapePlin || 0);
  }

  get totalEgresos() {
    return this.movimientos()
      .filter(m => m.tipo === 'EGRESO')
      .reduce((a, b) => a + Number(b.monto), 0);
  }

  get saldoActual() {
    return (this.resumen()?.montoApertura || 0) + this.totalIngresos - this.totalEgresos;
  }
}
