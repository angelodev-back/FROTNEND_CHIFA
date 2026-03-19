import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ToastService } from '../../../core/services/toast.service';
import { Usuario } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.css'
})
export class ClientProfileComponent implements OnInit {
   private authService = inject(AuthService);
   private reservaService = inject(ReservaService);
   private usuarioService = inject(UsuarioService);
   private toastService = inject(ToastService);

   user: Usuario | null = null;
   editModel = {
      email: '',
      celular: '',
      direccion: ''
   };
   
   totalReservas = 0;
   isSaving = signal(false);

   ngOnInit() {
      const storedUser = this.authService.getUserFromStorage();
      if (storedUser && storedUser.idUsuario) {
         this.usuarioService.getById(storedUser.idUsuario).subscribe({
            next: (res) => {
               this.user = res;
               this.editModel = {
                  email: res.email || '',
                  celular: res.celular || '',
                  direccion: res.direccion || ''
               };
            },
            error: () => this.toastService.error('Error al cargar perfil')
         });
      }
      this.cargarStats();
   }

   cargarStats() {
      this.reservaService.listarMisReservas().subscribe(rs => {
         this.totalReservas = rs.length;
      });
   }

   guardarCambios() {
      if (!this.user?.idUsuario) return;
      
      this.isSaving.set(true);
      const updateData = {
         ...this.editModel,
         nombres: this.user.nombres,
         apellidos: this.user.apellidos
      };

      this.usuarioService.updateProfile(this.user.idUsuario, updateData).subscribe({
         next: (res) => {
            this.isSaving.set(false);
            this.toastService.success('Perfil actualizado correctamente');
            this.user = res;
         },
         error: (err) => {
            this.isSaving.set(false);
            this.toastService.error(err.error?.message || 'Error al actualizar perfil');
         }
      });
   }

   logout() {
      this.authService.logout();
   }
}
