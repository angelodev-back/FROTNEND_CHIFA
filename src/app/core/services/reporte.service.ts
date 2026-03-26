import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VentaDTO {
    idComprobante: number;
    numeroComprobante: string;
    fechaEmision: string;
    total: number;
    metodoPago: string;
    nombreCliente: string;
    dniCliente: string;
    idPedido: number;
}

export interface DashboardData {
    totalUsuarios: number;
    usuariosActivos: number;
    totalProductos: number;
    productosStockBajo: number;
    totalMesas: number;
    totalReservas: number;
    reservasHoy: number;
    totalPedidos: number;
    ventasTotalesHoy: number;
    pedidosHoy: number;
    ingresosHoy: number;
    ticketPromedio: number;
    ventasPorMetodo: { [key: string]: number };
    rankingMozos: any[];
    listaProductosBajoStock: any[];
    ingresosMensuales: { [key: string]: number };
    productosTop: any[];
    pedidosRecientes: any[];
}

@Injectable({
    providedIn: 'root'
})
export class ReporteService {
    private apiUrl = `${environment.apiUrl}/reportes`;

    constructor(private http: HttpClient) { }

    getDashboardData(inicio?: string, fin?: string): Observable<DashboardData> {
        let params = new HttpParams();
        if (inicio) params = params.set('fechaInicio', inicio);
        if (fin) params = params.set('fechaFin', fin);
        return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`, { params });
    }

    getSummary(): Observable<DashboardData> {
        return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard/resumen`);
    }

    getRecentSales(): Observable<VentaDTO[]> {
        return this.http.get<VentaDTO[]>(`${this.apiUrl}/ventas`);
    }

    exportVentasPDF(inicio?: string, fin?: string): Observable<Blob> {
        const params: any = {};
        if (inicio) params.inicio = inicio;
        if (fin) params.fin = fin;
        return this.http.get(`${this.apiUrl}/ventas/pdf`, { params, responseType: 'blob' });
    }

    exportVentasExcel(inicio?: string, fin?: string): Observable<Blob> {
        const params: any = {};
        if (inicio) params.inicio = inicio;
        if (fin) params.fin = fin;
        return this.http.get(`${this.apiUrl}/ventas/excel`, { params, responseType: 'blob' });
    }

    exportPedidosPDF(estado?: string, inicio?: string, fin?: string): Observable<Blob> {
        const params: any = {};
        if (estado) params.estado = estado;
        if (inicio) params.inicio = inicio;
        if (fin) params.fin = fin;
        return this.http.get(`${this.apiUrl}/pedidos/pdf`, { params, responseType: 'blob' });
    }

    exportReservasPDF(inicio?: string, fin?: string): Observable<Blob> {
        const params: any = {};
        if (inicio) params.inicio = inicio;
        if (fin) params.fin = fin;
        return this.http.get(`${this.apiUrl}/reservas/pdf`, { params, responseType: 'blob' });
    }

    getTopSellingProducts(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/productos-top`);
    }
}
