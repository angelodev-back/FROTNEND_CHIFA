import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, tap } from 'rxjs';

export interface CajaTurnoDTO {
    idCajaTurno?: number;
    apertura: string;
    cierre?: string;
    montoInicial: number;
    montoFinal?: number;
    estado: 'ABIERTO' | 'CERRADO';
    usuarioApertura?: string;
}

export interface CajaResumenDTO {
    idCaja: number;
    usuarioAdmin: string;
    fechaApertura: string;
    fechaCierre: string | null;
    montoApertura: number;
    ingresosEfectivo: number;
    ingresosTarjeta: number;
    ingresosYapePlin: number;
    totalVentas: number;
    montoCierreCalculado: number;
    montoRealInformado: number | null;
    diferencia: number | null;
    estado: string;
}

export interface MovimientoCajaDTO {
    idMovimiento?: number;
    tipo: 'INGRESO' | 'EGRESO';
    concepto: string;
    monto: number;
    fechaMovimiento: string;
    usuarioNombre?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CajaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/caja`;

    getResumen(): Observable<CajaResumenDTO> {
        console.log("[SERVICE][CajaService] Solicitando resumen actual de caja...");
        return this.http.get<CajaResumenDTO>(`${this.apiUrl}/resumen`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][CajaService] Resumen de caja recibido:", res),
                error: (err) => console.error("[SERVICE][CajaService] Error al obtener resumen de caja:", err)
            })
        );
    }

    getMovimientos(idTurno: number): Observable<MovimientoCajaDTO[]> {
        console.log(`[SERVICE][CajaService] Solicitando movimientos para el turno ID: ${idTurno}...`);
        return this.http.get<MovimientoCajaDTO[]>(`${this.apiUrl}/movimientos/${idTurno}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][CajaService] Movimientos de caja recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][CajaService] Error al obtener movimientos de caja:", err)
            })
        );
    }

    abrirCaja(monto: number): Observable<any> {
        console.log(`[SERVICE][CajaService] Solicitando apertura de caja con monto: ${monto}...`);
        return this.http.post(`${this.apiUrl}/abrir`, { montoInicial: monto }).pipe(
            tap({
                next: (res) => console.log("[SERVICE][CajaService] Caja abierta exitosamente:", res),
                error: (err) => console.error("[SERVICE][CajaService] Error al abrir caja:", err)
            })
        );
    }

    cerrarCaja(montoFinal: number): Observable<CajaResumenDTO> {
        console.log(`[SERVICE][CajaService] Solicitando cierre de caja con monto final: ${montoFinal}...`);
        return this.http.post<CajaResumenDTO>(`${this.apiUrl}/cerrar`, { montoFinal }).pipe(
            tap({
                next: (res) => console.log("[SERVICE][CajaService] Caja cerrada exitosamente:", res),
                error: (err) => console.error("[SERVICE][CajaService] Error al cerrar caja:", err)
            })
        );
    }

    pagarPedido(data: { idPedido: number, metodoPago: string }): Observable<any> {
        console.log(`[SERVICE][CajaService] Procesando pago para pedido ID: ${data.idPedido}...`);
        return this.http.post(`${this.apiUrl}/pagar`, data).pipe(
            tap({
                next: (res) => console.log("[SERVICE][CajaService] Pago procesado con éxito:", res),
                error: (err) => console.error("[SERVICE][CajaService] Error al procesar pago:", err)
            })
        );
    }
}
