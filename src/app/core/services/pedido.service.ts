import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoDTO } from '../models/pedido.model';

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private apiUrl = `${environment.apiUrl}/pedidos`;

    constructor(private http: HttpClient) { }

    crearPedido(pedido: any): Observable<PedidoDTO> {
        console.log("[SERVICE][PedidoService] Creando nuevo pedido:", pedido);
        return this.http.post<PedidoDTO>(this.apiUrl, pedido).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Pedido creado exitosamente:", res),
                error: (err) => console.error("[SERVICE][PedidoService] Error al crear pedido:", err)
            })
        );
    }

    actualizarPedido(id: number, pedido: any): Observable<PedidoDTO> {
        console.log(`[SERVICE][PedidoService] Actualizando pedido ID ${id}:`, pedido);
        return this.http.put<PedidoDTO>(`${this.apiUrl}/${id}`, pedido).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Pedido actualizado exitosamente:", res),
                error: (err) => console.error(`[SERVICE][PedidoService] Error al actualizar pedido ID ${id}:`, err)
            })
        );
    }

    /** Obtiene un pedido por ID */
    getById(id: number): Observable<PedidoDTO> {
        console.log(`[SERVICE][PedidoService] Solicitando pedido con ID: ${id}...`);
        return this.http.get<PedidoDTO>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Pedido recibido:", res),
                error: (err) => console.error(`[SERVICE][PedidoService] Error al obtener pedido ID ${id}:`, err)
            })
        );
    }

    /** Alias de getById — para compatibilidad con componentes nuevos */
    getPedidoById(id: number): Observable<PedidoDTO> {
        return this.getById(id);
    }

    /** Pedidos ACTIVOS (estados que el negocio quiere ver en pantalla) */
    getActivos(): Observable<PedidoDTO[]> {
        console.log("[SERVICE][PedidoService] Solicitando lista de pedidos ACTIVOS...");
        return this.http.get<PedidoDTO[]>(`${this.apiUrl}/activos`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Pedidos activos recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][PedidoService] Error al obtener pedidos activos:", err)
            })
        );
    }

    /** Admin: búsqueda con filtros */
    searchAdmin(params: { estado?: string; inicio?: string; fin?: string; cliente?: string }): Observable<PedidoDTO[]> {
        console.log("[SERVICE][PedidoService] Buscando pedidos (filtros admin):", params);
        return this.http.get<PedidoDTO[]>(this.apiUrl, { params: params as any }).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Búsqueda de pedidos completada:", res.length, "items"),
                error: (err) => console.error("[SERVICE][PedidoService] Error en búsqueda de pedidos admin:", err)
            })
        );
    }

    /** Cocina: pedidos pendientes/preparando */
    getPedidosCocina(): Observable<PedidoDTO[]> {
        console.log("[SERVICE][PedidoService] Solicitando pedidos para COCINA...");
        return this.http.get<PedidoDTO[]>(`${this.apiUrl}/cocina`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Pedidos para cocina recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][PedidoService] Error al obtener pedidos de cocina:", err)
            })
        );
    }

    /** Mis pedidos (CLIENTE) */
    getMisPedidos(): Observable<PedidoDTO[]> {
        console.log("[SERVICE][PedidoService] Solicitando mis pedidos (cliente)...");
        return this.http.get<PedidoDTO[]>(`${this.apiUrl}/mis-pedidos`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Mis pedidos recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][PedidoService] Error al obtener mis pedidos:", err)
            })
        );
    }

    /** Enviar pedido a cocina */
    enviarACocina(id: number): Observable<void> {
        console.log(`[SERVICE][PedidoService] Enviando pedido ID ${id} a COCINA...`);
        return this.http.patch<void>(`${this.apiUrl}/${id}/enviar`, {}).pipe(
            tap({
                next: () => console.log(`[SERVICE][PedidoService] Pedido ID ${id} enviado a cocina`),
                error: (err) => console.error(`[SERVICE][PedidoService] Error al enviar pedido ID ${id} a cocina:`, err)
            })
        );
    }

    /** Agrega items a un pedido existente */
    agregarItems(id: number, pedido: any): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${id}/agregar-items`, pedido);
    }

    /** Cambiar estado del pedido */
    cambiarEstado(id: number, nuevoEstado: string): Observable<void> {
        console.log(`[SERVICE][PedidoService] Cambiando estado de pedido ID ${id} a ${nuevoEstado}...`);
        return this.http.patch<void>(`${this.apiUrl}/${id}/estado`, {}, { params: { nuevoEstado } }).pipe(
            tap({
                next: () => console.log(`[SERVICE][PedidoService] Estado del pedido ID ${id} actualizado a ${nuevoEstado}`),
                error: (err) => console.error(`[SERVICE][PedidoService] Error al cambiar estado del pedido ID ${id}:`, err)
            })
        );
    }

    /** Cocina: actualizar estado de un ítem del pedido */
    updateDetalleEstado(idDetalle: number, nuevoEstado: string): Observable<void> {
        console.log(`[SERVICE][PedidoService] Actualizando ítem detalle ID ${idDetalle} a estado cocina: ${nuevoEstado}...`);
        return this.http.patch<void>(`${this.apiUrl}/detalle/${idDetalle}/cocina`, {}, { params: { nuevoEstado } }).pipe(
            tap({
                next: () => console.log(`[SERVICE][PedidoService] Ítem detalle ID ${idDetalle} actualizado a ${nuevoEstado}`),
                error: (err) => console.error(`[SERVICE][PedidoService] Error al actualizar ítem detalle ID ${idDetalle}:`, err)
            })
        );
    }

    /** Mozo: Obtener pedido activo por mesa */
    getActivoPorMesa(idMesa: number): Observable<any> {
        return this.http.get<any>(`${environment.apiUrl}/mozo/pedidos/mesa/${idMesa}/activo`);
    }

    /** Mozo: Solicitar pago (Poner en estado EN_PAGO) */
    solicitarPago(id: number): Observable<void> {
        console.log(`[SERVICE][PedidoService] Poniendo pedido ID ${id} en estado EN_PAGO...`);
        return this.http.post<void>(`${this.apiUrl}/${id}/solicitar-pago`, {}).pipe(
            tap({
                next: () => console.log(`[SERVICE][PedidoService] Solicitud de pago (EN_PAGO) exitosa para pedido ID ${id}`),
                error: (err) => console.error(`[SERVICE][PedidoService] Error al solicitar pago para pedido ID ${id}:`, err)
            })
        );
    }

    /** Mozo: Confirmar pago (Cerrar pedido y liberar mesa) */
    confirmarPago(id: number, metodoPago: string): Observable<void> {
        console.log(`[SERVICE][PedidoService] Confirmando pago para pedido ID ${id} con método ${metodoPago}...`);
        return this.http.post<void>(`${this.apiUrl}/${id}/confirmar-pago`, {}, { params: { metodoPago } }).pipe(
            tap({
                next: () => console.log(`[SERVICE][PedidoService] Pago confirmado exitosamente para pedido ID ${id}`),
                error: (err) => console.error(`[SERVICE][PedidoService] Error al confirmar pago para pedido ID ${id}:`, err)
            })
        );
    }

    /** Cocina: Obtener historial (SERVIDO, PAGADO) */
    getHistorialCocina(): Observable<PedidoDTO[]> {
        console.log("[SERVICE][PedidoService] Solicitando HISTORIAL para cocina...");
        return this.http.get<PedidoDTO[]>(`${this.apiUrl}/historial-cocina`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Historial de cocina recibido:", res.length, "items"),
                error: (err) => console.error("[SERVICE][PedidoService] Error al obtener historial de cocina:", err)
            })
        );
    }

    /** Recepción: Obtener pedidos en proceso de pago (EN_PAGO) */
    getPedidosEnPago(): Observable<PedidoDTO[]> {
        console.log("[SERVICE][PedidoService] Solicitando pedidos EN PAGO para Recepción...");
        return this.http.get<PedidoDTO[]>(`${this.apiUrl}/en-pago`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][PedidoService] Pedidos en pago recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][PedidoService] Error al obtener pedidos en pago:", err)
            })
        );
    }
}
