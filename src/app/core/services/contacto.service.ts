import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Observable, tap } from 'rxjs';

export interface MensajeContactoDTO {
    idMensaje?: number;
    nombre: string;
    email: string;
    asunto: string;
    mensaje: string;
    fecha?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContactoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/contacto`;

    enviar(dto: MensajeContactoDTO): Observable<any> {
        console.log("[SERVICE][ContactoService] Enviando mensaje de contacto:", dto);
        return this.http.post(this.apiUrl, dto).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ContactoService] Mensaje enviado exitosamente:", res),
                error: (err) => console.error("[SERVICE][ContactoService] Error al enviar mensaje de contacto:", err)
            })
        );
    }

    listar(): Observable<MensajeContactoDTO[]> {
        console.log("[SERVICE][ContactoService] Solicitando lista de mensajes de contacto...");
        return this.http.get<MensajeContactoDTO[]>(this.apiUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ContactoService] Lista de mensajes recibida:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ContactoService] Error al obtener lista de mensajes:", err)
            })
        );
    }
}
