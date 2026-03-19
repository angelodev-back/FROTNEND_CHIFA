import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ComprobanteDTO } from '../models/comprobante.model';

export interface ComprobanteRequest {
    idPedido: number;
    tipoComprobante: string; // BOLETA o FACTURA
}

@Injectable({
    providedIn: 'root'
})
export class ComprobanteService {
    private apiUrl = `${environment.apiUrl}/comprobantes`;

    constructor(private http: HttpClient) { }

    // Corregido: POST a /api/comprobantes/generar
    generar(request: ComprobanteRequest): Observable<ComprobanteDTO> {
        return this.http.post<ComprobanteDTO>(`${this.apiUrl}/generar`, request);
    }

    getById(id: number): Observable<ComprobanteDTO> {
        return this.http.get<ComprobanteDTO>(`${this.apiUrl}/${id}`);
    }

    getByPedido(idPedido: number): Observable<ComprobanteDTO> {
        return this.http.get<ComprobanteDTO>(`${this.apiUrl}/pedido/${idPedido}`);
    }

    getAll(): Observable<ComprobanteDTO[]> {
        return this.http.get<ComprobanteDTO[]>(this.apiUrl);
    }
}
