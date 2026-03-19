import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, tap } from 'rxjs';

export interface ResenaDTO {
    idResena?: number;
    idCliente?: number;
    nombreCliente?: string;
    idProducto?: number;
    nombreProducto?: string;
    estrellas: number;
    comentario: string;
    fecha?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ResenaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/resenas`;

    crear(dto: ResenaDTO): Observable<ResenaDTO> {
        console.log("[SERVICE][ResenaService] Creando nueva reseña:", dto);
        return this.http.post<ResenaDTO>(this.apiUrl, dto).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ResenaService] Reseña creada exitosamente:", res),
                error: (err) => console.error("[SERVICE][ResenaService] Error al crear reseña:", err)
            })
        );
    }

    listarPorProducto(idProducto: number): Observable<ResenaDTO[]> {
        console.log(`[SERVICE][ResenaService] Solicitando reseñas para el producto ID: ${idProducto}...`);
        return this.http.get<ResenaDTO[]>(`${this.apiUrl}/producto/${idProducto}`).pipe(
            tap({
                next: (res) => console.log(`[SERVICE][ResenaService] Reseñas para producto ${idProducto} recibidas:`, res.length, "items"),
                error: (err) => console.error(`[SERVICE][ResenaService] Error al obtener reseñas del producto ${idProducto}:`, err)
            })
        );
    }

    listarRecientes(): Observable<ResenaDTO[]> {
        console.log("[SERVICE][ResenaService] Solicitando reseñas recientes...");
        return this.http.get<ResenaDTO[]>(`${this.apiUrl}/recientes`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ResenaService] Reseñas recientes recibidas:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ResenaService] Error al obtener reseñas recientes:", err)
            })
        );
    }
}
