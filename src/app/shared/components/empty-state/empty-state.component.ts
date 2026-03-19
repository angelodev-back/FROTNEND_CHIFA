import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.css'
})
export class EmptyStateComponent {
  @Input() icon: string = '🔍';
  @Input() title: string = 'No se encontraron resultados';
  @Input() description: string = 'Intenta ajustar tus filtros o buscar algo diferente.';
  @Input() actionLabel: string = '';
  @Input() loading: boolean = false;
  
  @Output() onAction = new EventEmitter<void>();

  executeAction() {
    this.onAction.emit();
  }
}
