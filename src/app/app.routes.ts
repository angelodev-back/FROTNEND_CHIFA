import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'auth/login'
    },
    { path: 'auth/login', loadComponent: () => import('@app/features/auth/login/login.component').then(m => m.LoginComponent) },

    // ─── ADMIN ────────────────────────────────────────────────────────────────
    {
        path: 'admin',
        loadComponent: () => import('@app/features/admin/layout/admin-layout/admin-layout').then(m => m.AdminLayout),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
            { path: 'dashboard', loadComponent: () => import('@app/features/admin/dashboard/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard) },
            { path: 'usuarios', loadComponent: () => import('@app/features/admin/usuarios/usuario-list/usuario-list').then(m => m.UsuarioList) },
            { path: 'usuarios/nuevo', loadComponent: () => import('@app/features/admin/usuarios/usuario-form/usuario-form').then(m => m.UsuarioForm) },
            { path: 'usuarios/editar/:id', loadComponent: () => import('@app/features/admin/usuarios/usuario-form/usuario-form').then(m => m.UsuarioForm) },
            { path: 'menu', loadComponent: () => import('@app/features/admin/menu/menu-list/menu-list').then(m => m.AdminMenuList) },
            { path: 'menu/nuevo', loadComponent: () => import('@app/features/admin/menu/menu-form/menu-form').then(m => m.AdminMenuForm) },
            { path: 'menu/editar/:id', loadComponent: () => import('@app/features/admin/menu/menu-form/menu-form').then(m => m.AdminMenuForm) },
            { path: 'mesas', loadComponent: () => import('@app/features/admin/mesas/mesa-list/mesa-list').then(m => m.AdminMesaList) },
            { path: 'mesas/nuevo', loadComponent: () => import('@app/features/admin/mesas/mesa-form/mesa-form').then(m => m.AdminMesaForm) },
            { path: 'mesas/editar/:id', loadComponent: () => import('@app/features/admin/mesas/mesa-form/mesa-form').then(m => m.AdminMesaForm) },
            { path: 'reservas', loadComponent: () => import('@app/features/admin/reservas/reserva-list/reserva-list').then(m => m.AdminReservaList) },
            { path: 'reservas/nuevo', loadComponent: () => import('@app/features/admin/reservas/reserva-form/reserva-form').then(m => m.AdminReservaForm) },
            { path: 'reservas/editar/:id', loadComponent: () => import('@app/features/admin/reservas/reserva-form/reserva-form').then(m => m.AdminReservaForm) },
            { path: 'pedidos', loadComponent: () => import('@app/features/admin/pedidos/admin-pedido-list/admin-pedido-list').then(m => m.AdminPedidoList) },
            { path: 'reportes', loadComponent: () => import('@app/features/admin/reportes/reporte-dashboard/reporte-dashboard').then(m => m.AdminReporteDashboard) },
            { path: 'configuracion', loadComponent: () => import('@app/features/admin/configuracion/configuracion').then(m => m.AdminConfiguracion) },
            { path: 'auditoria', loadComponent: () => import('@app/features/audit/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // ─── MOZO ─────────────────────────────────────────────────────────────────
    {
        path: 'mozo',
        loadComponent: () => import('@app/features/admin/layout/admin-layout/admin-layout').then(m => m.AdminLayout),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'MOZO'] },
        children: [
            { path: 'dashboard', loadComponent: () => import('@app/features/mozo/dashboard/mozo-dashboard.component').then(m => m.MozoDashboardComponent) },
            { path: 'mesas', loadComponent: () => import('@app/features/mozo/mesas/mozo-mesa-list.component').then(m => m.MozoMesaListComponent) },
            { path: 'pedidos', loadComponent: () => import('@app/features/mozo/pedidos/mozo-pedido-list.component').then(m => m.MozoPedidoListComponent) },
            { path: 'listos', loadComponent: () => import('@app/features/mozo/listos/mozo-pedidos-listos.component').then(m => m.MozoPedidosListosComponent) },
            { path: 'cuenta', loadComponent: () => import('@app/features/mozo/cuenta/mozo-cuenta-mesa.component').then(m => m.MozoCuentaMesaComponent) },
            { path: 'tomar-pedido/:idMesa', loadComponent: () => import('@app/features/mozo/tomar-pedido/mozo-tomar-pedido.component').then(m => m.MozoTomarPedidoComponent) },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

    // ─── COCINERO ─────────────────────────────────────────────────────────────
    {
        path: 'cocina',
        loadComponent: () => import('@app/features/admin/layout/admin-layout/admin-layout').then(m => m.AdminLayout),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'COCINERO'] },
        children: [
            { path: 'monitor', loadComponent: () => import('@app/features/cocina/cocina-monitor/cocina-monitor.component').then(m => m.CocinaMonitorComponent) },
            { path: 'preparacion', loadComponent: () => import('@app/features/cocina/monitor/cocina-preparacion.component').then(m => m.CocinaPreparacionComponent) },
            { path: 'listos', loadComponent: () => import('@app/features/cocina/monitor/cocina-listos.component').then(m => m.CocinaListosComponent) },
            { path: 'historial', loadComponent: () => import('@app/features/cocina/monitor/cocina-historial.component').then(m => m.CocinaHistorialComponent) },
            { path: '', redirectTo: 'monitor', pathMatch: 'full' }
        ]
    },

    // ─── RECEPCIONISTA ────────────────────────────────────────────────────────
    {
        path: 'recepcion',
        loadComponent: () => import('@app/features/admin/layout/admin-layout/admin-layout').then(m => m.AdminLayout),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'RECEPCIONISTA'] },
        children: [
            { path: 'dashboard', loadComponent: () => import('@app/features/recepcionista/dashboard/recepcion-dashboard.component').then(m => m.RecepcionDashboardComponent) },
            { path: 'pagos', loadComponent: () => import('@app/features/recepcionista/pagos/recepcion-pagos.component').then(c => c.RecepcionPagosComponent) }, 
            { path: 'reservas', loadComponent: () => import('@app/features/recepcionista/reservas/recepcion-reserva-list.component').then(m => m.RecepcionReservaListComponent) },
            { path: 'reservas/nuevo', loadComponent: () => import('@app/features/recepcionista/reservas/recepcion-reserva-form.component').then(m => m.RecepcionReservaFormComponent) },
            { path: 'reservas/editar/:id', loadComponent: () => import('@app/features/recepcionista/reservas/recepcion-reserva-form.component').then(m => m.RecepcionReservaFormComponent) },
            { path: 'reservas/detalle/:id', loadComponent: () => import('@app/features/recepcionista/reservas/recepcion-reserva-detail.component').then(m => m.RecepcionReservaDetailComponent) },
            { path: '', redirectTo: 'reservas', pathMatch: 'full' }
        ]
    },

    // ─── CLIENTE ──────────────────────────────────────────────────────────────
    {
        path: 'cliente',
        loadComponent: () => import('@app/features/cliente/layout/client-layout/client-layout.component').then(m => m.ClientLayoutComponent),
        children: [
            { path: 'home', loadComponent: () => import('@app/features/cliente/home/home.component').then(m => m.HomeComponent) },
            { path: 'menu', loadComponent: () => import('@app/features/cliente/menu/client-menu.component').then(m => m.ClientMenuComponent) },
            {
                path: 'reservas',
                canActivate: [roleGuard],
                data: { roles: ['CLIENTE'] },
                loadComponent: () => import('@app/features/cliente/reservas/reserva-form.component').then(m => m.ReservaFormComponent)
            },
            {
                path: 'mis-reservas',
                canActivate: [roleGuard],
                data: { roles: ['CLIENTE'] },
                loadComponent: () => import('@app/features/cliente/reservas/mis-reservas.component').then(m => m.MisReservasComponent)
            },
            { path: 'resenas', loadComponent: () => import('@app/features/cliente/resenas/resenas.component').then(m => m.ResenasComponent) },
            { path: 'contacto', loadComponent: () => import('@app/features/cliente/contacto/contact.component').then(m => m.ContactComponent) },
            {
                path: 'perfil',
                canActivate: [roleGuard],
                data: { roles: ['CLIENTE'] },
                loadComponent: () => import('@app/features/cliente/perfil/client-profile.component').then(m => m.ClientProfileComponent)
            },
            { path: '', redirectTo: 'home', pathMatch: 'full' }
        ]
    },

    { path: '**', redirectTo: 'cliente/home' }
];

