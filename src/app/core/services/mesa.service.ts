import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MesaDTO } from '../models/mesa.model';

@Injectable({
    providedIn: 'root'
})
export class MesaService {
    private apiUrl = `${environment.apiUrl}/mesas`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<MesaDTO[]> {
        console.log("[SERVICE][MesaService] Solicitando lista completa de mesas...");
        return this.http.get<MesaDTO[]>(this.apiUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][MesaService] Mesas recibidas:", res.length, "items"),
                error: (err) => console.error("[SERVICE][MesaService] Error al obtener mesas:", err)
            })
        );
    }

    getById(id: number): Observable<MesaDTO> {
        console.log(`[SERVICE][MesaService] Solicitando mesa con ID: ${id}...`);
        return this.http.get<MesaDTO>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][MesaService] Mesa recibida:", res),
                error: (err) => console.error(`[SERVICE][MesaService] Error al obtener mesa ID ${id}:`, err)
            })
        );
    }

    create(mesa: Partial<MesaDTO>): Observable<MesaDTO> {
        console.log("[SERVICE][MesaService] Creando nueva mesa:", mesa);
        return this.http.post<MesaDTO>(this.apiUrl, mesa).pipe(
            tap({
                next: (res) => console.log("[SERVICE][MesaService] Mesa creada exitosamente:", res),
                error: (err) => console.error("[SERVICE][MesaService] Error al crear mesa:", err)
            })
        );
    }

    update(id: number, mesa: Partial<MesaDTO>): Observable<MesaDTO> {
        console.log(`[SERVICE][MesaService] Actualizando mesa ID ${id}:`, mesa);
        return this.http.put<MesaDTO>(`${this.apiUrl}/${id}`, mesa).pipe(
            tap({
                next: (res) => console.log("[SERVICE][MesaService] Mesa actualizada exitosamente:", res),
                error: (err) => console.error(`[SERVICE][MesaService] Error al actualizar mesa ID ${id}:`, err)
            })
        );
    }

    delete(id: number): Observable<void> {
        console.log(`[SERVICE][MesaService] Eliminando mesa ID: ${id}...`);
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: () => console.log(`[SERVICE][MesaService] Mesa ID ${id} eliminada satisfactoriamente`),
                error: (err) => console.error(`[SERVICE][MesaService] Error al eliminar mesa ID ${id}:`, err)
            })
        );
    }

    updateStatus(id: number, status: string): Observable<void> {
        console.log(`[SERVICE][MesaService] Actualizando estado de mesa ID ${id} a ${status}...`);
        return this.http.patch<void>(`${this.apiUrl}/${id}/status`, {}, { params: { status } }).pipe(
            tap({
                next: () => console.log(`[SERVICE][MesaService] Estado de mesa ID ${id} actualizado a ${status}`),
                error: (err) => console.error(`[SERVICE][MesaService] Error al actualizar estado de mesa ID ${id}:`, err)
            })
        );
    }

    atenderMesa(id: number): Observable<MesaDTO> {
        console.log(`[SERVICE][MesaService] Marcando mesa ID ${id} como atendida...`);
        return this.http.post<MesaDTO>(`${this.apiUrl}/${id}/atender`, {}).pipe(
            tap({
                next: (res) => console.log("[SERVICE][MesaService] Mesa marcada como atendida:", res),
                error: (err) => console.error(`[SERVICE][MesaService] Error al atender mesa ID ${id}:`, err)
            })
        );
    }
}
