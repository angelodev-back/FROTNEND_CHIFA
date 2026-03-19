export interface AuditLogDTO {
    id: number;
    fecha: string;
    usuario: string;
    accion: string;
    modulo: string;
    entidad: string;
    idEntidad: string;
    descripcion: string;
    ipCliente: string;
}
