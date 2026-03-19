import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
        router.navigate(['/auth/login']);
        return false;
    }

    const normalizedRole = authService.getNormalizedRole();
    const expectedRoles = route.data['roles'] as string[];
    console.log('[RoleGuard] EXPECTED ROLES FOR THIS ROUTE:', expectedRoles);

    console.log(`[RoleGuard] Path: ${route.routeConfig?.path}, Current Role: "${normalizedRole}", Expected: ${expectedRoles}`);

    if (expectedRoles && !expectedRoles.some(r => r.toUpperCase() === normalizedRole)) {
        console.warn(`[RoleGuard] Access denied for role "${normalizedRole}". Redirecting...`);
        authService.redirectByRole(normalizedRole);
        return false;
    }

    console.log(`[RoleGuard] Access granted for role "${normalizedRole}"`);
    return true;
};
