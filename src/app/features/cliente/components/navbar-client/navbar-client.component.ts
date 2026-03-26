import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-navbar-client',
    standalone: true,
    imports: [CommonModule, RouterModule],
  templateUrl: './navbar-client.component.html',
  styleUrl: './navbar-client.component.css'
})
export class NavbarClientComponent {
    private authService = inject(AuthService);

    userName = signal(this.authService.getCurrentUser()?.nombre || 'Usuario');
    scrolled = signal(false);

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', () => {
                this.scrolled.set(window.scrollY > 20);
            });
        }
    }

    isLoggedIn(): boolean {
        return this.authService.isAuthenticated();
    }

    logout(): void {
        this.authService.logout();
    }
}
