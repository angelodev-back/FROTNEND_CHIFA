import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notificacion } from '../models/notificacion.model';

/**
 * Servicio de notificaciones en tiempo real.
 * Las notificaciones se alimentan desde WebSocket (WsService),
 * NO desde mocks. Este servicio es el receptor, no el generador de datos.
 */
@Injectable({
    providedIn: 'root'
})
export class NotificacionService {
    private notificaciones$ = new BehaviorSubject<Notificacion[]>([]);

    constructor() {
        // NO se inicializan datos mock.
        // Las notificaciones llegan vía agregarNotificacion() desde componentes
        // que escuchan WebSocket (ej: SidebarComponent, CocinaMonitorComponent, MozoDashboard)
    }

    getNotificaciones(): Observable<Notificacion[]> {
        return this.notificaciones$.asObservable();
    }

    agregarNotificacion(notif: Notificacion): void {
        const current = this.notificaciones$.value;
        this.notificaciones$.next([notif, ...current]);
    }

    marcarLeida(id: number): void {
        const current = this.notificaciones$.value.map(n =>
            n.id === id ? { ...n, leida: true } : n
        );
        this.notificaciones$.next(current);
    }

    marcarTodasLeidas(): void {
        const current = this.notificaciones$.value.map(n => ({ ...n, leida: true }));
        this.notificaciones$.next(current);
    }

    getContadorNoLeidas(): Observable<number> {
        return this.notificaciones$.pipe(
            map(notifs => notifs.filter(n => !n.leida).length)
        );
    }

    limpiarNotificaciones(): void {
        this.notificaciones$.next([]);
    }
}
