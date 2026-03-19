export interface Usuario {
    idUsuario: number;
    nombres: string;
    apellidos: string;
    email: string;
    dni: string;
    celular: string;
    estado: boolean;
    rol: Rol;
    direccion?: string;
    fechaRegistro?: string;
}

export interface Rol {
    idRol: number;
    nombre: string;
}
