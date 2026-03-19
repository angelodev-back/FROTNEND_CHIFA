import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLogDTO } from '../models/audit.model';

@Injectable({
    providedIn: 'root'
})
export class AuditService {
    private apiUrl = `${environment.apiUrl}/auditoria`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<AuditLogDTO[]> {
        return this.http.get<AuditLogDTO[]>(this.apiUrl);
    }
}
