export interface CajaTurnoDTO {
    idCajaTurno: number;
    fechaApertura: string;
    fechaCierre: string | null;
    montoInicial: number;
    montoFinal: number | null;
    estado: 'ABIERTA' | 'CERRADA';
    nombreUsuarioApertura: string;
    nombreUsuarioCierre: string | null;
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
    idMovimiento: number;
    fecha: string;
    monto: number;
    tipo: 'INGRESO' | 'EGRESO';
    metodoPago: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN';
    descripcion: string;
}
