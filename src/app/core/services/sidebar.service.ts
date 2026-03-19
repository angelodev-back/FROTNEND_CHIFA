import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

export interface MenuItem {
    label: string;
    icon: string;
    route: string;
    badge?: string;
}

export interface MenuGroup {
    groupLabel: string;
    items: MenuItem[];
}

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    private authService = inject(AuthService);

    private readonly MENUS: Record<string, MenuGroup[]> = {
        ADMIN: [
            {
                groupLabel: '',
                items: [
                    { label: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
                    { label: 'Mesas', icon: 'grid', route: '/admin/mesas' },
                    { label: 'Reservas', icon: 'calendar', route: '/admin/reservas' },
                    { label: 'Pedidos', icon: 'shopping-bag', route: '/admin/pedidos' },
                    { label: 'Caja', icon: 'dollar-sign', route: '/admin/caja' },
                    { label: 'Productos', icon: 'book-open', route: '/admin/menu' },
                    { label: 'Inventario', icon: 'package', route: '/admin/inventario' },
                    { label: 'Usuarios', icon: 'users', route: '/admin/usuarios' },
                    { label: 'Reportes', icon: 'bar-chart', route: '/admin/reportes' },
                    { label: 'Auditoría', icon: 'shield', route: '/admin/auditoria' },
                    { label: 'Configuración', icon: 'settings', route: '/admin/configuracion' },
                ]
            }
        ],
        MOZO: [
            {
                groupLabel: 'MI ÁREA',
                items: [
                    { label: 'Dashboard', icon: 'home', route: '/mozo/dashboard' },
                    { label: 'Mesas', icon: 'grid', route: '/mozo/mesas' },
                    { label: 'Mis Pedidos', icon: 'shopping-bag', route: '/mozo/pedidos' },
                    { label: 'Pedidos Listos', icon: 'check-circle', route: '/mozo/listos' },
                    { label: 'Cuenta', icon: 'file-text', route: '/mozo/cuenta' },
                ]
            }
        ],
        COCINERO: [
            {
                groupLabel: 'COCINA',
                items: [
                    { label: 'Monitor KDS', icon: 'zap', route: '/cocina/monitor' },
                    { label: 'En Preparación', icon: 'activity', route: '/cocina/preparacion' },
                    { label: 'Listos', icon: 'check-circle', route: '/cocina/listos' },
                    { label: 'Historial', icon: 'clock', route: '/cocina/historial' },
                ]
            }
        ],
        RECEPCIONISTA: [
            {
                groupLabel: 'RECEPCIÓN',
                items: [
                    { label: 'Dashboard', icon: 'home', route: '/recepcion/dashboard' },
                    { label: 'Reservas', icon: 'calendar', route: '/recepcion/reservas' },
                    { label: 'Mesas', icon: 'grid', route: '/recepcion/mesas' },
                ]
            }
        ]
    };

    getMenu(): MenuGroup[] {
        const role = this.authService.getRole();
        return this.MENUS[role] || this.MENUS['ADMIN'];
    }
}
