import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoriaDTO } from '../models/categoria.model';

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private apiUrl = `${environment.apiUrl}/categorias`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<CategoriaDTO[]> {
        console.log("[SERVICE][CategoriaService] Solicitando lista de categorías...");
        return this.http.get<CategoriaDTO[]>(this.apiUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][CategoriaService] Categorías recibidas:", res.length, "items"),
                error: (err) => console.error("[SERVICE][CategoriaService] Error al obtener categorías:", err)
            })
        );
    }
}
