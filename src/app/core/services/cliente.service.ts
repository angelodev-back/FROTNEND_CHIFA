import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cliente {
    idCliente?: number;
    dni: string;
    nombre: string;
    email?: string;
    telefono?: string;
    fechaRegistro?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClienteService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/usuarios`;

    getAll(): Observable<Cliente[]> {
        return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
    }

    getById(id: number): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
    }

    getByDni(dni: string): Observable<Cliente> {
        return this.http.get<Cliente>(`${this.apiUrl}/dni/${dni}`);
    }

    create(cliente: any): Observable<Cliente> {
        return this.http.post<Cliente>(`${this.apiUrl}/registro-rapido`, cliente);
    }

    update(id: number, cliente: any): Observable<Cliente> {
        return this.http.put<Cliente>(`${this.apiUrl}/${id}/admin`, cliente);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
