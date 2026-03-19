import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

    private fb = inject(FormBuilder);
    public authService = inject(AuthService);
    private router = inject(Router);

    loginForm: FormGroup;
    errorMessage: string = '';
    loading: boolean = false;

    constructor() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        // Siempre limpiar sesión al entrar al login
        this.authService.logout();
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.loading = true;
            this.errorMessage = '';
            this.authService.login(this.loginForm.value).subscribe({
                next: () => { this.loading = false; },
                error: (err) => {
                    this.loading = false;
                    this.errorMessage = err?.error?.message || 'Correo o contraseña incorrectos. Verifica que el backend esté iniciado.';
                }
            });
        }
    }

    fillCredentials(email: string, password: string): void {
        this.loginForm.patchValue({ email, password });
        this.errorMessage = '';
    }
}

