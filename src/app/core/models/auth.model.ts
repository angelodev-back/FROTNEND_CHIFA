export interface LoginRequest {
    email: string;
    password: string;
}

export interface JwtResponse {
    token: string;
    idUsuario: number;
    email: string;
    nombres: string;
    apellidos: string;
    role: string;
}

export interface UsuarioDTO {
    idUsuario: number;
    nombres: string;
    apellidos: string;
    email: string;
    estado: boolean;
    fechaRegistro: string;
    nombreRol: string;
}
