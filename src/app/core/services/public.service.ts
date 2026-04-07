import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RestauranteInfo {
    idInfo?: number;
    nombre: string;
    direccion: string;
    telefono: string;
    horario: string;
    facebook: string;
    instagram: string;
    latitud: number;
    longitud: number;
    ruc?: string;
    email?: string;
    aforo?: number;
    descripcion?: string;
}

@Injectable({
    providedIn: 'root'
})
export class PublicService {
    private apiUrl = `${environment.apiUrl}/public`;

    constructor(private http: HttpClient) { }

    getRestauranteInfo(): Observable<RestauranteInfo> {
        return this.http.get<RestauranteInfo>(`${this.apiUrl}/restaurante`);
    }

    getMenuPublico(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/productos/public`);
    }

    getCategorias(): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/categorias`);
    }

    enviarMensajeContacto(data: any): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/contacto`, data);
    }
}
