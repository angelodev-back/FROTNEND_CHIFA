import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReporteService, DashboardData } from '../../../../core/services/reporte.service';
import { MesaService } from '../../../../core/services/mesa.service';
import { PedidoService } from '../../../../core/services/pedido.service';
import { WsService } from '../../../../core/services/ws.service';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, DatePipe, BaseChartDirective],
    templateUrl: './admin-dashboard.html',
    styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
    private reporteService = inject(ReporteService);
    private mesaService = inject(MesaService);
    private pedidoService = inject(PedidoService);
    private wsService = inject(WsService);

    today = new Date();
    data = signal<DashboardData | null>(null);
    mesas = signal<any[]>([]);
    pedidosRecientes = signal<any[]>([]);

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
    public doughnutChartLabels: string[] = [];
    public doughnutChartData: ChartData<'doughnut'> = {
        labels: [],
        datasets: [{ data: [] }]
    };
    public doughnutChartType: 'doughnut' = 'doughnut';
    public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    };

    // Chart Configuration: Ventas por Método (Pie)
    public pieChartData: ChartData<'pie'> = {
        labels: [],
        datasets: [{ data: [] }]
    };
    public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    };

    ngOnInit(): void {
        console.log("[ADMIN][Dashboard] Inicializando componente de dashboard...");
        this.cargarDatos();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wsService.subscribe('/topic/dashboard/stats').subscribe({
            next: () => this.cargarDatos()
        });
        this.wsService.subscribe('/topic/pedidos/estado').subscribe({
            next: () => this.cargarDatos()
        });
        this.wsService.subscribe('/topic/mesas').subscribe({
            next: () => this.cargarDatos()
        });
    }

    cargarDatos() {
        console.log("[ADMIN][Dashboard][cargarDatos] Solicitando datos consolidados para el dashboard (forkJoin)...");
        forkJoin({
            dashboard: this.reporteService.getSummary(),
            mesas: this.mesaService.getAll(),
            pedidos: this.pedidoService.getActivos()
        }).subscribe({
            next: (res) => {
                console.log("[ADMIN][Dashboard][cargarDatos] Datos del dashboard recibidos exitosamente");
                this.data.set(res.dashboard);
                this.mesas.set(res.mesas.slice(0, 6));
                this.pedidosRecientes.set(res.dashboard.pedidosRecientes || []);
                this.updateCharts(res.dashboard);
            },
            error: (err) => {
                console.error("[ADMIN][Dashboard][cargarDatos] Error al cargar datos del dashboard:", err);
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
            this.doughnutChartLabels = dashboard.productosTop.map(p => p.nombre);
            this.doughnutChartData.labels = this.doughnutChartLabels;
            this.doughnutChartData.datasets[0].data = dashboard.productosTop.map(p => p.cantidad);
        }

        // Update Pie Chart (Ventas por Método)
        if (dashboard.ventasPorMetodo) {
            const methods = Object.keys(dashboard.ventasPorMetodo);
            this.pieChartData.labels = methods;
            this.pieChartData.datasets[0].data = methods.map(m => dashboard.ventasPorMetodo[m]);
        }
    }

    get topProducts() {
        const top = this.data()?.productosTop || [];
        // Mapeamos a la estructura que espera la vista
        const colors = ['#2563eb', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];
        return top.map((p, i) => ({
            nombre: p.nombre,
            count: p.cantidad,
            revenue: p.totalRecaudado?.toFixed(2),
            pct: p.porcentaje || (100 - (i * 15)),
            color: colors[i % colors.length]
        }));
    }
}
