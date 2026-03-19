import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class RolService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/roles`;

    getAll(): Observable<Rol[]> {
        return this.http.get<Rol[]>(this.apiUrl);
    }
}
