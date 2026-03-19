import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RestauranteInfo } from './public.service';

@Injectable({
    providedIn: 'root'
})
export class ConfiguracionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/configuracion`;

    getConfig(): Observable<RestauranteInfo> {
        console.log("[SERVICE][ConfiguracionService] Solicitando información de configuración del restaurante...");
        return this.http.get<RestauranteInfo>(this.apiUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ConfiguracionService] Configuración recibida:", res),
                error: (err) => console.error("[SERVICE][ConfiguracionService] Error al obtener configuración:", err)
            })
        );
    }

    updateConfig(data: RestauranteInfo): Observable<RestauranteInfo> {
        console.log("[SERVICE][ConfiguracionService] Actualizando configuración del restaurante:", data);
        return this.http.put<RestauranteInfo>(this.apiUrl, data).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ConfiguracionService] Configuración actualizada exitosamente:", res),
                error: (err) => console.error("[SERVICE][ConfiguracionService] Error al actualizar configuración:", err)
            })
        );
    }
}
