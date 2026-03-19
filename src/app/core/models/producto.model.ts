export interface ProductoDTO {
    idProducto: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenUrl: string;
    estado: boolean;
    idCategoria: number;
    nombreCategoria: string;
}
