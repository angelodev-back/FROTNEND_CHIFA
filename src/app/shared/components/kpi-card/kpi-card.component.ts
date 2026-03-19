import {
    Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-kpi-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './kpi-card.component.html',
    styleUrl: './kpi-card.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent implements OnInit, OnDestroy {
    @Input() titulo = '';
    @Input() valor = 0;
    @Input() unidad = '';
    @Input() icono: 'pedidos' | 'ventas' | 'mesas' | 'clientes' | 'rating' | 'tiempo' = 'pedidos';
    @Input() color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal' = 'blue';
    @Input() tendencia: 'up' | 'down' | 'neutral' = 'neutral';
    @Input() tendenciaPct = 0;
    @Input() tendenciaLabel = 'vs. ayer';
    @Input() prefijo = '';

    displayValue = 0;
    private sub?: Subscription;
    private cdr = inject(ChangeDetectorRef);

    ngOnInit(): void {
        // Animación CountUp: de 0 al valor final en ~800ms
        const steps = 40;
        const increment = this.valor / steps;
        let step = 0;
        this.sub = interval(20).pipe(take(steps)).subscribe(() => {
            step++;
            this.displayValue = Math.round(increment * step);
            if (step === steps) this.displayValue = this.valor;
            this.cdr.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    get colorClass(): string {
        return `icon-${this.color}`;
    }

    get tendenciaClass(): string {
        if (this.tendencia === 'up') return 'trend-up';
        if (this.tendencia === 'down') return 'trend-down';
        return 'trend-neutral';
    }
}
