import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactoService } from '@app/core/services/contacto.service';
import { PublicService } from '@app/core/services/public.service';
import { ToastService } from '@app/core/services/toast.service';

@Component({
   selector: 'app-contact',
   standalone: true,
   imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
   private contactoService = inject(ContactoService);
   private publicService = inject(PublicService);
   private toastService = inject(ToastService);

   info: any;
   model = { nombre: '', email: '', asunto: 'Consulta General', mensaje: '' };

   ngOnInit() {
      this.publicService.getRestauranteInfo().subscribe(resp => this.info = resp);
   }

   enviar() {
      this.contactoService.enviar(this.model).subscribe({
         next: () => {
            this.toastService.success('Mensaje enviado. Te responderemos a la brevedad.');
            this.model = { nombre: '', email: '', asunto: 'Consulta General', mensaje: '' };
         },
         error: () => this.toastService.error('Error al enviar mensaje')
      });
   }
}
