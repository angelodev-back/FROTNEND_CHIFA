import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegistroRapidoDTO {
    dni: string;
    nombre: string;
    email?: string;
    telefono?: string;
    idMesa: number;
    cantidadPersonas: number;
    observaciones?: string;
    fechaHoraReserva?: string;
}

@Injectable({
    providedIn: 'root'
})
export class RecepcionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/recepcion`;

    registroRapido(dto: RegistroRapidoDTO): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/registro-rapido`, dto);
    }
}
