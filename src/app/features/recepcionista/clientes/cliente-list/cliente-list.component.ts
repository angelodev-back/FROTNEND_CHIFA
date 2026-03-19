import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UsuarioService } from '@app/core/services/usuario.service';
import { Usuario } from '@app/core/models/usuario.model';
import { ReservaService, ReservaDTO } from '@app/core/services/reserva.service';
import { forkJoin } from 'rxjs';
import { ToastService } from '@app/core/services/toast.service';

export interface ClienteReservaItem {
  cliente: Usuario;
  reservaActiva?: ReservaDTO;
}

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private reservaService = inject(ReservaService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  list = signal<ClienteReservaItem[]>([]);
  filteredList = signal<ClienteReservaItem[]>([]);
  searchTerm = '';

  ngOnInit(): void {
    console.log("[RECEPCION][ClienteList] Inicializando listado de clientes y reservas...");
    this.cargarDatos();
  }

  cargarDatos(): void {
    console.log("[RECEPCION][ClienteList][cargarDatos] Solicitando clientes y reservas...");
    forkJoin({
      clientes: this.usuarioService.getClientes(),
      reservas: this.reservaService.listarTodas()
    }).subscribe({
      next: (res) => {
        const reservasActivas = res.reservas.filter(r => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA');

        const mappedList: ClienteReservaItem[] = res.clientes.map(c => {
          // Intentar coincidir por DNI, Teléfono o Email
          const reserva = reservasActivas.find(r =>
            (r.dniCliente && r.dniCliente === c.dni) ||
            (r.telefonoCliente && r.telefonoCliente === c.celular)
          );
          return { cliente: c, reservaActiva: reserva };
        });

        // Ordenar: primero los que tienen reserva
        mappedList.sort((a, b) => {
          if (a.reservaActiva && !b.reservaActiva) return -1;
          if (!a.reservaActiva && b.reservaActiva) return 1;
          return a.cliente.nombres.localeCompare(b.cliente.nombres);
        });

        this.list.set(mappedList);
        this.filteredList.set(mappedList);
      },
      error: (err) => {
        console.error("[RECEPCION][ClienteList] Error al obtener datos:", err);
      }
    });
  }

  filterClientes(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredList.set(this.list());
      return;
    }

    const filtered = this.list().filter(item =>
      item.cliente.nombres.toLowerCase().includes(term) ||
      item.cliente.apellidos.toLowerCase().includes(term) ||
      (item.cliente.dni && item.cliente.dni.includes(term)) ||
      item.cliente.email.toLowerCase().includes(term)
    );
    this.filteredList.set(filtered);
  }

  nuevaReserva(cliente: Usuario): void {
    // Almacenamos info en sessionStorage o lo pasamos por queryParams (simulando para el form)
    this.router.navigate(['/recepcion/reservas/nuevo'], {
      queryParams: {
        dni: cliente.dni,
        nombre: cliente.nombres + ' ' + cliente.apellidos,
        telefono: cliente.celular
      }
    });
  }

  cancelarReserva(reserva: ReservaDTO): void {
    if (confirm(`¿Estás seguro que deseas cancelar la reserva #${reserva.idReserva} de ${reserva.nombreCliente}?`)) {
      this.reservaService.cancelar(reserva.idReserva!).subscribe({
        next: () => {
          this.toastService.success('Reserva cancelada');
          this.cargarDatos();
        },
        error: () => {
          this.toastService.error('Error al cancelar la reserva');
        }
      });
    }
  }
}
