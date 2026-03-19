import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResenaService, ResenaDTO } from '../../../core/services/resena.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-resenas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resenas.component.html',
  styleUrl: './resenas.component.css'
})
export class ResenasComponent implements OnInit {
   private resenaService = inject(ResenaService);
   private toastService = inject(ToastService);

   rating = 0;
   nuevoComentario = '';
   resenas = signal<ResenaDTO[]>([]);
   avgRating = signal<number>(0);

   ngOnInit() {
      this.cargarResenas();
   }

   cargarResenas() {
      this.resenaService.listarRecientes().subscribe({
         next: (rs) => {
            this.resenas.set(rs);
            if (rs.length > 0) {
               const sum = rs.reduce((acc, curr) => acc + curr.estrellas, 0);
               this.avgRating.set(parseFloat((sum / rs.length).toFixed(1)));
            }
         }
      });
   }

   enviar() {
      const dto: ResenaDTO = {
         estrellas: this.rating,
         comentario: this.nuevoComentario
      };

      this.resenaService.crear(dto).subscribe({
         next: () => {
            this.toastService.success('¡Gracias por tu reseña!');
            this.nuevoComentario = '';
            this.rating = 0;
            this.cargarResenas();
         },
         error: () => this.toastService.error('Error al enviar reseña')
      });
   }
}
