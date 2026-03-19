import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardDTO } from '../models/dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getSummary(): Observable<DashboardDTO> {
        console.log("[SERVICE][DashboardService] Solicitando resumen del dashboard...");
        return this.http.get<DashboardDTO>(`${this.apiUrl}/resumen`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][DashboardService] Resumen del dashboard recibido:", res),
                error: (err) => console.error("[SERVICE][DashboardService] Error al obtener resumen del dashboard:", err)
            })
        );
    }
}
