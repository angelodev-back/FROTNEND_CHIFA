import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    pedidosHoy: number;
    ingresosHoy: number;
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

    getDashboardData(): Observable<DashboardData> {
        return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
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
