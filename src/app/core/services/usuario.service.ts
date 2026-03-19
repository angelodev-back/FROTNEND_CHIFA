import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/usuarios`;

    getAll(): Observable<Usuario[]> {
        console.log("[SERVICE][UsuarioService] Solicitando lista de todos los usuarios...");
        return this.http.get<Usuario[]>(this.apiUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Lista de usuarios recibida:", res.length, "items"),
                error: (err) => console.error("[SERVICE][UsuarioService] Error al obtener usuarios:", err)
            })
        );
    }

    getClientes(): Observable<Usuario[]> {
        console.log("[SERVICE][UsuarioService] Solicitando lista de clientes...");
        return this.http.get<Usuario[]>(`${this.apiUrl}/clientes`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Lista de clientes recibida:", res.length, "items"),
                error: (err) => console.error("[SERVICE][UsuarioService] Error al obtener clientes:", err)
            })
        );
    }

    getById(id: number): Observable<Usuario> {
        console.log(`[SERVICE][UsuarioService] Solicitando usuario con ID: ${id}...`);
        return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Usuario recibido:", res),
                error: (err) => console.error(`[SERVICE][UsuarioService] Error al obtener usuario ID ${id}:`, err)
            })
        );
    }

    createByAdmin(usuario: any): Observable<Usuario> {
        console.log("[SERVICE][UsuarioService] Creando nuevo usuario por admin:", usuario);
        return this.http.post<Usuario>(`${this.apiUrl}/admin`, usuario).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Usuario creado exitosamente:", res),
                error: (err) => console.error("[SERVICE][UsuarioService] Error al crear usuario:", err)
            })
        );
    }

    updateRol(id: number, idRol: number): Observable<Usuario> {
        console.log(`[SERVICE][UsuarioService] Actualizando rol del usuario ID ${id} a rol ID ${idRol}...`);
        return this.http.patch<Usuario>(`${this.apiUrl}/${id}/rol`, { idRol }).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Rol actualizado exitosamente:", res),
                error: (err) => console.error(`[SERVICE][UsuarioService] Error al actualizar rol ID ${id}:`, err)
            })
        );
    }

    updateProfile(id: number, usuario: any): Observable<Usuario> {
        console.log(`[SERVICE][UsuarioService] Actualizando perfil del usuario ID ${id}:`, usuario);
        return this.http.put<Usuario>(`${this.apiUrl}/${id}/profile`, usuario).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Perfil actualizado exitosamente:", res),
                error: (err) => console.error(`[SERVICE][UsuarioService] Error al actualizar perfil ID ${id}:`, err)
            })
        );
    }

    toggleActivo(id: number, estado: boolean): Observable<void> {
        console.log(`[SERVICE][UsuarioService] Toggling estado activo del usuario ID ${id} a ${estado}...`);
        return this.http.patch<void>(`${this.apiUrl}/${id}/status`, null, { params: { active: estado.toString() } }).pipe(
            tap({
                next: () => console.log(`[SERVICE][UsuarioService] Estado del usuario ID ${id} actualizado a ${estado}`),
                error: (err) => console.error(`[SERVICE][UsuarioService] Error al cambiar estado del usuario ID ${id}:`, err)
            })
        );
    }

    delete(id: number): Observable<void> {
        console.log(`[SERVICE][UsuarioService] Eliminando usuario ID: ${id}...`);
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: () => console.log(`[SERVICE][UsuarioService] Usuario ID ${id} eliminado satisfactoriamente`),
                error: (err) => console.error(`[SERVICE][UsuarioService] Error al eliminar usuario ID ${id}:`, err)
            })
        );
    }

    getRoles(): Observable<any[]> {
        console.log("[SERVICE][UsuarioService] Solicitando lista de roles...");
        return this.http.get<any[]>(`${environment.apiUrl}/roles`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Lista de roles recibida:", res.length, "items"),
                error: (err) => console.error("[SERVICE][UsuarioService] Error al obtener roles:", err)
            })
        );
    }

    updateByAdmin(id: number, usuario: any): Observable<Usuario> {
        console.log(`[SERVICE][UsuarioService] Actualización completa por admin del usuario ID ${id}:`, usuario);
        return this.http.put<Usuario>(`${this.apiUrl}/${id}/admin`, usuario).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Usuario actualizado por admin exitosamente:", res),
                error: (err) => console.error(`[SERVICE][UsuarioService] Error al actualizar usuario ID ${id} por admin:`, err)
            })
        );
    }

    registrarClienteRapido(usuario: any): Observable<Usuario> {
        console.log("[SERVICE][UsuarioService] Registrando cliente rápido:", usuario);
        // Volviendo a la ruta original por estabilidad
        return this.http.post<Usuario>(`${this.apiUrl}/registro-rapido`, usuario).pipe(
            tap({
                next: (res) => console.log("[SERVICE][UsuarioService] Cliente registrado rápidamente:", res),
                error: (err) => console.error("[SERVICE][UsuarioService] Error al registrar cliente rápido:", err)
            })
        );
    }
}
