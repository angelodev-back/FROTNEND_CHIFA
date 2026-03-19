/**
 * Mesa representa una mesa física del restaurante.
 * Soporta tanto la forma del backend (idMesa/numeroMesa)
 * como la forma simplificada (id/numero) para código nuevo.
 */
export interface Mesa {
    idMesa?: number;
    id?: number;
    numeroMesa?: number;
    numero?: number;
    capacidad: number;
    estado: 'DISPONIBLE' | 'OCUPADA' | 'RESERVADA' | 'MANTENIMIENTO' | 'EN_LIMPIEZA' | 'EN_PAGO';
    idMozoAsignado?: number;
    nombreMozoAsignado?: string;
    idCliente?: number;
    nombreCliente?: string;
    dniCliente?: string;
    telefonoCliente?: string;
    atendidaPorMi?: boolean;
}

/** Alias de compatibilidad para código legacy */
export type MesaDTO = Mesa;
