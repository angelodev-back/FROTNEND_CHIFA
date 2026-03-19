export interface Inventario {
    idInventario: number;
    nombreInsumo: string;
    cantidadActual: number;
    unidadMedida: 'KG' | 'LITROS' | 'UNIDADES' | 'GRAMOS';
    stockMinimo: number;
    ultimaActualizacion?: string;
}

export interface MovimientoInventarioRequest {
    idInventario: number;
    cantidad: number;
    observacion: string;
}
