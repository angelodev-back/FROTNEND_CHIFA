import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JwtResponse, LoginRequest } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private router = inject(Router);

    // Uso de Signals de Angular 17+ para reactividad
    public currentUser = signal<JwtResponse | null>(this.getUserFromStorage());

    constructor(private http: HttpClient) { }

    login(credentials: LoginRequest): Observable<JwtResponse> {
        console.log("[SERVICE][AuthService] Intentando login para el usuario:", credentials.email);
        return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap({
                next: (response) => {
                    if (response && response.token) {
                        console.log("[SERVICE][AuthService] Login exitoso. Bienvendio:", response.email);
                        // Normalizar rol antes de guardar para consistencia en toda la app
                        response.role = this.normalizeRole(response.role);

                        localStorage.setItem('currentUser', JSON.stringify(response));
                        this.currentUser.set(response);

                        // Redirección automática post-login
                        console.log('[SERVICE][AuthService] JWT Token Payload:', response.token.split('.')[1]);
                        this.redirectByRole(response.role);
                    }
                },
                error: (err) => console.error("[SERVICE][AuthService] Error durante el login:", err)
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        this.currentUser.set(null);
        this.router.navigate(['/auth/login']);
    }

    public getUserFromStorage(): JwtResponse | null {
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr) as JwtResponse;
                if (user && user.role) {
                    user.role = this.normalizeRole(user.role);
                }
                return user;
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    getToken(): string | null {
        const user = this.currentUser();
        return user ? user.token : null;
    }

    getRole(): string {
        const user = this.currentUser();
        return user ? this.normalizeRole(user.role) : '';
    }

    // NORMALIZACIÓN DE ROLES
    public normalizeRole(role: string | null): string {
        if (!role) return '';
        const normalized = role.toUpperCase().replace('ROLE_', '').trim();
        console.log(`[AuthService] Normalized role: "${role}" -> "${normalized}"`);
        return normalized;
    }

    public getNormalizedRole(): string {
        const role = this.getRole();
        console.log(`[AuthService] Current normalized role from signal: "${role}"`);
        return role;
    }

    public redirectByRole(normalizedRole: string): void {
        switch (normalizedRole) {
            case 'ADMIN':
                this.router.navigate(['/admin/dashboard']);
                break;
            case 'RECEPCIONISTA':
                this.router.navigate(['/recepcion/dashboard']);
                break;
            case 'MOZO':
                this.router.navigate(['/mozo/dashboard']);
                break;
            case 'COCINERO':
                this.router.navigate(['/cocina/monitor']);
                break;
            case 'CLIENTE':
                this.router.navigate(['/cliente/home']);
                break;
            default:
                this.router.navigate(['/auth/login']);
                break;
        }
    }

    getCurrentUser(): { idUsuario: number; nombre: string; email: string; role?: string } | null {
        const user = this.currentUser();
        if (!user) return null;
        return {
            idUsuario: user.idUsuario,
            nombre: user.nombres ? `${user.nombres} ${user.apellidos}` : (user.email?.split('@')[0] ?? 'Usuario'),
            email: user.email,
            role: user.role
        };
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
