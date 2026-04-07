import {
    Component, Input, Output, EventEmitter, OnInit, inject,
    ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificacionService } from '../../../core/services/notificacion.service';
import { SidebarService, MenuGroup, MenuItem } from '../../../core/services/sidebar.service';
import { Observable } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

/** Definición de item de menú por rol (Ahora en SidebarService) */

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css',
    animations: [
        trigger('slideInOut', [
            state('in', style({ width: '260px', opacity: 1 })),
            state('out', style({ width: '0', opacity: 0, overflow: 'hidden' })),
            transition('in <=> out', animate('0.3s cubic-bezier(0.4, 0, 0.2, 1)'))
        ])
    ]
})
export class SidebarComponent implements OnInit {
    @Input() role = '';
    @Input() activeMenu = '';
    @Output() menuChange = new EventEmitter<string>();

    private authService = inject(AuthService);
    private notificacionService = inject(NotificacionService);
    private sidebarService = inject(SidebarService);

    contadorNotificaciones$!: Observable<number>;
    userName = '';
    userEmail = '';
    menuGroups: MenuGroup[] = [];

    // Menús removidos (ahora en SidebarService)

    ngOnInit(): void {
        this.contadorNotificaciones$ = this.notificacionService.getContadorNoLeidas();
        const user = this.authService.getCurrentUser();
        this.userName = user?.nombre ?? 'Usuario';
        this.userEmail = user?.email ?? '';
        this.menuGroups = this.sidebarService.getMenu();
    }

    selectMenu(item: MenuItem): void {
        this.activeMenu = item.label;
        this.menuChange.emit(item.label);
    }

    logout(): void {
        this.authService.logout();
    }

    getRoleLabel(): string {
        const labels: Record<string, string> = {
            ADMIN: 'Administrador',
            MOZO: 'Mozo / Mesero',
            COCINERO: 'Chef / Cocinero',
            CLIENTE: 'Cliente',
            RECEPCIONISTA: 'Recepcionista'
        };
        return labels[this.role.toUpperCase()] ?? this.role;
    }

    getRoleColor(): string {
        const colors: Record<string, string> = {
            ADMIN: '#2563eb',
            MOZO: '#8b5cf6',
            COCINERO: '#f59e0b',
            CLIENTE: '#10b981',
            RECEPCIONISTA: '#ec4899'
        };
        return colors[this.role.toUpperCase()] ?? '#64748b';
    }
}
