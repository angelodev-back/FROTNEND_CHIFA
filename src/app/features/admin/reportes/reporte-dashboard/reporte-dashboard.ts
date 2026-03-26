import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReporteService, DashboardData } from '../../../../core/services/reporte.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { KpiCardComponent } from '../../../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-admin-reporte-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BaseChartDirective, KpiCardComponent],
  templateUrl: './reporte-dashboard.html',
  styleUrl: './reporte-dashboard.css'
})
export class AdminReporteDashboard implements OnInit {
  private reporteService = inject(ReporteService);

  fechaInicio = signal<string>(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  fechaFin = signal<string>(new Date().toISOString().split('T')[0]);

  resumen = signal<DashboardData | null>(null);
  cargando = signal<boolean>(false);

  // Chart Configuration: Ingresos Mensuales (Line)
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Ingresos S/',
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.1)',
      fill: 'origin',
      tension: 0.4
    }]
  };
  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  // Chart Configuration: Productos Top (Doughnut)
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#2563eb', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'] }]
  };
  public doughnutChartType: 'doughnut' = 'doughnut';
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Se llama desde el HTML cuando cambian las fechas
  onFilterChange() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.reporteService.getDashboardData(this.fechaInicio(), this.fechaFin()).subscribe({
      next: (data) => {
        this.resumen.set(data);
        this.updateCharts(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error("Error al cargar datos de reportes:", err);
        this.cargando.set(false);
      }
    });
  }

  private updateCharts(dashboard: DashboardData) {
    // Update Line Chart (Ingresos Mensuales)
    if (dashboard.ingresosMensuales) {
      const sortedKeys = Object.keys(dashboard.ingresosMensuales).sort();
      this.lineChartData.labels = sortedKeys;
      this.lineChartData.datasets[0].data = sortedKeys.map(k => dashboard.ingresosMensuales[k]);
    }

    // Update Doughnut Chart (Productos Top)
    if (dashboard.productosTop) {
      this.doughnutChartData.labels = dashboard.productosTop.map(p => p.nombre);
      this.doughnutChartData.datasets[0].data = dashboard.productosTop.map(p => p.cantidad);
    }
  }

  exportarPDF() {
    this.reporteService.exportVentasPDF(this.fechaInicio(), this.fechaFin()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Ventas_${this.fechaInicio()}_${this.fechaFin()}.pdf`;
        a.click();
      },
      error: (err) => console.error("Error al exportar PDF:", err)
    });
  }

  exportarExcel() {
    this.reporteService.exportVentasExcel(this.fechaInicio(), this.fechaFin()).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Reporte_Ventas_${this.fechaInicio()}_${this.fechaFin()}.xlsx`;
        a.click();
      },
      error: (err) => console.error("Error al exportar Excel:", err)
    });
  }

  get topProductsMapped() {
    return (this.resumen()?.productosTop || []).map((p, i) => ({
      nombre: p.nombre,
      cantidad: p.cantidad,
      total: p.totalRecaudado || 0,
      pct: p.porcentaje || (100 - (i * 15))
    }));
  }
}
