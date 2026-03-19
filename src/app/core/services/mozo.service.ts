import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MozoDashboard {
    mesasAtendidas: number;
    pedidosPendientes: number;
    pedidosListos: number;
    pedidosServidos: number;
    reservasHoy: number;
}

@Injectable({
    providedIn: 'root'
})
export class MozoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/mozo`;

    getDashboard(): Observable<MozoDashboard> {
        console.log("[SERVICE][MozoService] Solicitando dashboard del mozo...");
        return this.http.get<MozoDashboard>(`${this.apiUrl}/dashboard`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][MozoService] Dashboard del mozo recibido:", res),
                error: (err) => console.error("[SERVICE][MozoService] Error al obtener dashboard del mozo:", err)
            })
        );
    }
}
