import { Injectable, signal } from '@angular/core';

export interface Toast {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    public toasts = signal<Toast[]>([]);
    private counter = 0;

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
        const id = this.counter++;
        const toast: Toast = { message, type, id };
        this.toasts.update(t => [...t, toast]);

        setTimeout(() => {
            this.remove(id);
        }, 5000);
    }

    success(message: string): void {
        this.show(message, 'success');
    }

    error(message: string): void {
        this.show(message, 'error');
    }

    info(message: string): void {
        this.show(message, 'info');
    }

    warning(message: string): void {
        this.show(message, 'warning');
    }

    remove(id: number): void {
        this.toasts.update(t => t.filter(toast => toast.id !== id));
    }
}
