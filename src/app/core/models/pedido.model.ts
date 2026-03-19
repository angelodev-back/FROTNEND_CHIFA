export interface Pedido {
    id: number;
    cliente: string;
    mesa: number;
    items: PedidoItem[];
    estado: 'PENDIENTE' | 'EN_PREPARACION' | 'PREPARANDO' | 'LISTO' | 'SERVIDO' | 'EN_PAGO' | 'ENTREGADO' | 'PAGADO' | 'CANCELADO';
    total: number;
    horaIngreso: Date;
}

export interface PedidoItem {
    id: number;
    productoId: number;
    nombre: string;
    cantidad: number;
    precio: number;
    subtotal: number;
}

/**
 * Forma DTO extendida que viene del backend para las vistas (cocina, mozo, admin).
 * El campo estado es opcional (?) para evitar errores cuando el backend lo omite.
 * Se incluyen TODOS los valores posibles que el backend puede devolver.
 */
export interface PedidoDTO {
    idPedido: number;
    idMesa?: number;
    numeroMesa?: number;
    nombreMozo?: string;
    nombreCliente?: string;
    dniCliente?: string;
    tipoPedido: string;
    fechaPedido: Date | string;
    observaciones?: string;
    // Estado del pedido — backend puede devolver cualquiera de estos valores:
    estado?: 'PENDIENTE' | 'EN_PREPARACION' | 'PREPARANDO' | 'LISTO' | 'SERVIDO' | 'EN_PAGO' | 'ENTREGADO' | 'PAGADO' | 'CANCELADO';
    total: number;
    detalles: DetallePedidoDTO[];
}

export interface DetallePedidoDTO {
    idDetalle: number;
    nombreProducto: string;
    idProducto?: number;
    cantidad: number;
    nota?: string;
    estadoCocina: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO';
    precioUnitario?: number;
    subtotal?: number;
}
