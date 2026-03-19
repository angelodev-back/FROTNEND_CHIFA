import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Inventario, MovimientoInventarioRequest } from '../models/inventario.model';

@Injectable({
    providedIn: 'root'
})
export class InventarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/inventario`;

    getAll(): Observable<Inventario[]> {
        console.log("[SERVICE][InventarioService] Solicitando lista completa de inventario...");
        return this.http.get<Inventario[]>(this.apiUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][InventarioService] Inventario recibido:", res.length, "items"),
                error: (err) => console.error("[SERVICE][InventarioService] Error al obtener inventario:", err)
            })
        );
    }

    getById(id: number): Observable<Inventario> {
        console.log(`[SERVICE][InventarioService] Solicitando insumo con ID: ${id}...`);
        return this.http.get<Inventario>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][InventarioService] Insumo recibido:", res),
                error: (err) => console.error(`[SERVICE][InventarioService] Error al obtener insumo ID ${id}:`, err)
            })
        );
    }

    create(insumo: Partial<Inventario>): Observable<Inventario> {
        console.log("[SERVICE][InventarioService] Creando nuevo insumo:", insumo);
        return this.http.post<Inventario>(this.apiUrl, insumo).pipe(
            tap({
                next: (res) => console.log("[SERVICE][InventarioService] Insumo creado exitosamente:", res),
                error: (err) => console.error("[SERVICE][InventarioService] Error al crear insumo:", err)
            })
        );
    }

    registrarEntrada(request: MovimientoInventarioRequest): Observable<void> {
        console.log("[SERVICE][InventarioService] Registrando ENTRADA de inventario:", request);
        return this.http.post<void>(`${this.apiUrl}/entrada`, request).pipe(
            tap({
                next: () => console.log("[SERVICE][InventarioService] Entrada registrada exitosamente"),
                error: (err) => console.error("[SERVICE][InventarioService] Error al registrar entrada:", err)
            })
        );
    }

    registrarSalida(request: MovimientoInventarioRequest): Observable<void> {
        console.log("[SERVICE][InventarioService] Registrando SALIDA de inventario:", request);
        return this.http.post<void>(`${this.apiUrl}/salida`, request).pipe(
            tap({
                next: () => console.log("[SERVICE][InventarioService] Salida registrada exitosamente"),
                error: (err) => console.error("[SERVICE][InventarioService] Error al registrar salida:", err)
            })
        );
    }

    delete(id: number): Observable<void> {
        console.log(`[SERVICE][InventarioService] Eliminando insumo ID: ${id}...`);
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: () => console.log(`[SERVICE][InventarioService] Insumo ID ${id} eliminado satisfactoriamente`),
                error: (err) => console.error(`[SERVICE][InventarioService] Error al eliminar insumo ID ${id}:`, err)
            })
        );
    }

    getHistorial(): Observable<any[]> {
        console.log("[SERVICE][InventarioService] Solicitando historial de movimientos...");
        return this.http.get<any[]>(`${this.apiUrl}/historial`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][InventarioService] Historial recibido:", res.length, "items"),
                error: (err) => console.error("[SERVICE][InventarioService] Error al obtener historial:", err)
            })
        );
    }
}
