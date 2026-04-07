import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { LoadingService } from '../services/loading.service';
import { ToastService } from '../services/toast.service';
import { ServerStatusService } from '../services/server-status.service';
import { Observable, catchError, throwError, finalize, tap } from 'rxjs';

let isExpiring = false;

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    const loadingService = inject(LoadingService);
    const toastService = inject(ToastService);
    const serverStatusService = inject(ServerStatusService);
    const token = authService.getToken();

    loadingService.show();

    let authReq = req;
    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(authReq).pipe(
        tap(() => {
            // If request succeeds, server is online
            serverStatusService.setOffline(false);
        }),
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                console.error(`[AUTH][401] Unauthorized error on: ${req.method} ${req.url}`);
                if (!isExpiring) {
                    isExpiring = true;
                    console.warn('[AUTH][401] Session expired. Redirecting to logout.');
                    authService.logout();
                    toastService.error('Sesión expirada');
                    // Reset flag after a delay to allow future logins
                    setTimeout(() => isExpiring = false, 3000);
                }
            } else if (error.status === 403) {
                console.error(`[AUTH][403] Forbidden access on: ${req.method} ${req.url}`);
                toastService.error('Sin permisos para esta acción');
            } else if (error.status === 0) {
                console.error(`[AUTH][0] Connection error on: ${req.method} ${req.url}`);
                serverStatusService.setOffline(true);
                toastService.error('Error de conexión con el servidor');
            }
            return throwError(() => error);
        }),
        finalize(() => loadingService.hide())
    );
};
