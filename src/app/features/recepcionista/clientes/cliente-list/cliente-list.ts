import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private usuarioService = inject(UsuarioService);
  private toastService = inject(ToastService);

  searchTerm = signal('');
  usuarios = signal<Usuario[]>([]);
  isLoading = signal(true);

  clientes = computed(() => {
    return this.usuarios().filter(u => u.rol?.nombre === 'CLIENTE' &&
      (u.nombres?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        u.apellidos?.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
        u.dni?.includes(this.searchTerm())));
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.isLoading.set(true);
    this.usuarioService.getAll().subscribe({
      next: (res: Usuario[]) => {
        this.usuarios.set(res);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error("[RECEPCION][ClienteList] Error:", err);
        this.toastService.error("No se pudieron cargar los clientes");
        this.isLoading.set(false);
      }
    });
  }
}
