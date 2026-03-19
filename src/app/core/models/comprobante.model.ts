export interface ComprobanteDTO {
    idComprobante: number;
    serie: string;
    numeroCorrelativo: number;
    tipoComprobante: 'BOLETA' | 'FACTURA';
    fechaEmision: string;
    subtotal: number;
    igv: number;
    total: number;
    estado: 'EMITIDO' | 'ANULADO';
    idPedido: number;
    nombreUsuarioEmisor: string;
}
