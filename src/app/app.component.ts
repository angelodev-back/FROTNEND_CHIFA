import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';
import { LoadingService } from './core/services/loading.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'chifa-frontend';
    public authService = inject(AuthService);
    public toastService = inject(ToastService);
    public loadingService = inject(LoadingService);
}
