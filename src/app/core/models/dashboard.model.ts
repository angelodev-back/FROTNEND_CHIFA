export interface ProductoTopDTO {
    nombre: string;
    cantidad: number;
}

export interface DashboardDTO {
    ventasHoy: number;
    pedidosHoy: number;
    ventasPorMetodo: { [key: string]: number };
    productosTop: ProductoTopDTO[];
    ingresosMensuales: { [key: string]: number };
    totalUsuariosActivos: number;
    productosStockBajo: number;
}
