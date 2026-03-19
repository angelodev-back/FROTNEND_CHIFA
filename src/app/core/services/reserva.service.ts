import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReservaDTO {
    idReserva?: number;
    idCliente?: number;
    nombreCliente?: string;
    apellidoCliente?: string;
    telefonoCliente?: string;
    emailCliente?: string;
    dniCliente?: string;
    fechaHoraReserva?: string;
    cantidadPersonas?: number;
    estado?: string;
    observaciones?: string;
    idMesa?: number;
    numeroMesa?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReservaService {
    private apiUrl = `${environment.apiUrl}/reservas`;

    constructor(private http: HttpClient) { }

    listarTodas(): Observable<ReservaDTO[]> {
        console.log("[SERVICE][ReservaService] Solicitando todas las reservas...");
        return this.http.get<ReservaDTO[]>(this.apiUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ReservaService] Reservas recibidas:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ReservaService] Error al obtener reservas:", err)
            })
        );
    }

    getById(id: number): Observable<ReservaDTO> {
        console.log(`[SERVICE][ReservaService] Solicitando reserva ID: ${id}...`);
        return this.http.get<ReservaDTO>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ReservaService] Reserva recibida:", res),
                error: (err) => console.error(`[SERVICE][ReservaService] Error al obtener reserva ID ${id}:`, err)
            })
        );
    }

    getByFecha(fecha: string): Observable<ReservaDTO[]> {
        console.log(`[SERVICE][ReservaService] Solicitando reservas para la fecha: ${fecha}...`);
        return this.http.get<ReservaDTO[]>(`${this.apiUrl}/fecha`, { params: { date: fecha } }).pipe(
            tap({
                next: (res) => console.log(`[SERVICE][ReservaService] Reservas para ${fecha} recibidas:`, res.length, "items"),
                error: (err) => console.error(`[SERVICE][ReservaService] Error al obtener reservas para ${fecha}:`, err)
            })
        );
    }

    crearReserva(reserva: Partial<ReservaDTO>): Observable<ReservaDTO> {
        console.log("[SERVICE][ReservaService] Creando nueva reserva:", reserva);
        return this.http.post<ReservaDTO>(this.apiUrl, reserva).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ReservaService] Reserva creada exitosamente:", res),
                error: (err) => console.error("[SERVICE][ReservaService] Error al crear reserva:", err)
            })
        );
    }

    actualizarReserva(id: number, reserva: Partial<ReservaDTO>): Observable<ReservaDTO> {
        console.log(`[SERVICE][ReservaService] Actualizando reserva ID ${id}:`, reserva);
        return this.http.put<ReservaDTO>(`${this.apiUrl}/${id}`, reserva).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ReservaService] Reserva actualizada exitosamente:", res),
                error: (err) => console.error(`[SERVICE][ReservaService] Error al actualizar reserva ID ${id}:`, err)
            })
        );
    }

    cambiarEstado(id: number, estado: string): Observable<void> {
        console.log(`[SERVICE][ReservaService] Cambiando estado de reserva ID ${id} a ${estado}...`);
        return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, null, { params: { status: estado } }).pipe(
            tap({
                next: () => console.log(`[SERVICE][ReservaService] Estado de reserva ID ${id} actualizado a ${estado}`),
                error: (err) => console.error(`[SERVICE][ReservaService] Error al cambiar estado de reserva ID ${id}:`, err)
            })
        );
    }

    confirmar(id: number): Observable<void> {
        return this.cambiarEstado(id, 'CONFIRMADA');
    }

    cancelar(id: number): Observable<void> {
        return this.cambiarEstado(id, 'CANCELADA');
    }

    listarMisReservas(): Observable<ReservaDTO[]> {
        console.log("[SERVICE][ReservaService] Solicitando mis reservas (cliente)...");
        return this.http.get<ReservaDTO[]>(`${this.apiUrl}/mis-reservas`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ReservaService] Mis reservas recibidas:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ReservaService] Error al obtener mis reservas:", err)
            })
        );
    }

    eliminar(id: number): Observable<void> {
        console.log(`[SERVICE][ReservaService] Eliminando reserva ID: ${id}...`);
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: () => console.log(`[SERVICE][ReservaService] Reserva ID ${id} eliminada satisfactoriamente`),
                error: (err) => console.error(`[SERVICE][ReservaService] Error al eliminar reserva ID ${id}:`, err)
            })
        );
    }
}
