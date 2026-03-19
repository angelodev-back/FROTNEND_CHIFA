import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MesaService } from '../../../core/services/mesa.service';
import { ReservaService, ReservaDTO } from '../../../core/services/reserva.service';
import { ToastService } from '../../../core/services/toast.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Cliente } from '../../../core/services/cliente.service';

@Component({
  selector: 'app-recepcion-reserva-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recepcion-reserva-form.component.html',
  styleUrl: './recepcion-reserva-form.component.css'
})
export class RecepcionReservaFormComponent implements OnInit {
  private mesaService = inject(MesaService);
  private reservaService = inject(ReservaService);
  private usuarioService = inject(UsuarioService);
  private clienteService = inject(ClienteService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mesasDisponibles = signal<any[]>([]);
  model = {
    nombreCliente: '',
    apellidoCliente: '',
    emailCliente: '',
    telefonoCliente: '',
    dniCliente: '',
    fechaReserva: '',
    horaReserva: '',
    numeroPersonas: 2,
    idMesa: null,
    estadoReserva: 'CONFIRMADA'
  };

  ngOnInit() {
    console.log("[RECEPCION][ReservaForm] Inicializando formulario de nueva reserva...");

    // Auto-fill current date and time (+5 minutes buffer to avoid "past" error)
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    this.model.fechaReserva = now.toISOString().split('T')[0];
    this.model.horaReserva = now.toTimeString().split(' ')[0].substring(0, 5);

    this.route.queryParams.subscribe((params: any) => {
      if (params['dni']) this.model.dniCliente = params['dni'];
      if (params['nombre']) this.model.nombreCliente = params['nombre'];
      if (params['apellido']) this.model.apellidoCliente = params['apellido'];
      if (params['telefono']) this.model.telefonoCliente = params['telefono'];
      if (params['email']) this.model.emailCliente = params['email'];
    });

    this.mesaService.getAll().subscribe({
      next: (res: any[]) => {
        const disponibles = res.filter((m: any) => m.estado?.toString().toUpperCase() === 'DISPONIBLE');
        console.log("[RECEPCION][ReservaForm] Mesas disponibles cargadas:", disponibles.length);
        this.mesasDisponibles.set(disponibles);
      },
      error: (err: HttpErrorResponse) => {
        console.error("[RECEPCION][ReservaForm] Error al obtener mesas:", err);
      }
    });
  }

  onMesaChange(idMesa: any) {
    const mesa = this.mesasDisponibles().find((m: any) => m.idMesa == idMesa);
    if (mesa) {
      this.model.numeroPersonas = mesa.capacidad || 2;
      console.log("[RECEPCION][ReservaForm] Capacidad auto-asignada por mesa:", this.model.numeroPersonas);
    }
  }

  guardar() {
    if (!this.model.dniCliente) {
      this.toastService.error("El DNI es obligatorio para registrar al cliente");
      return;
    }

    console.log("[RECEPCION][ReservaForm][guardar] Iniciando proceso de registro y reserva...");

    // 1. Verificar si el cliente existe o registrarlo
    this.clienteService.getByDni(this.model.dniCliente).subscribe({
      next: (cliente: any) => {
        console.log("[RECEPCION][ReservaForm] Cliente ya existe, procediendo a reserva.");
        const idCliente = cliente.idUsuario || cliente.idCliente;
        this.crearReservaFinal(idCliente);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          console.log("[RECEPCION][ReservaForm] Cliente no existe, registrando cuenta rápido...");
          this.registrarNuevoCliente();
        } else {
          console.error("[RECEPCION][ReservaForm] Error al verificar cliente:", err);
          this.toastService.error("Error al validar el cliente");
        }
      }
    });
  }

  private registrarNuevoCliente() {
    const usuarioDTO = {
      nombres: this.model.nombreCliente,
      apellidos: this.model.apellidoCliente,
      email: this.model.emailCliente,
      dni: this.model.dniCliente,
      celular: this.model.telefonoCliente,
      password: this.model.dniCliente, // DNI como contraseña por defecto
      idRol: 3 // Requerido por la validación del DTO
    };

    console.log("[RECEPCION][ReservaForm] Enviando DTO de registro:", usuarioDTO);

    this.usuarioService.registrarClienteRapido(usuarioDTO).subscribe({
      next: (res: any) => {
        console.log("[RECEPCION][ReservaForm] Cliente registrado exitosamente.", res);
        this.crearReservaFinal(res.idUsuario);
      },
      error: (err: HttpErrorResponse) => {
        console.error("[RECEPCION][ReservaForm] Error al registrar cliente:", err);
        this.toastService.error("No se pudo registrar la cuenta del cliente");
      }
    });
  }

  private crearReservaFinal(idCliente?: number) {
    // Si tenemos idCliente, no enviamos campos redundantes al backend para mantener integridad
    const dto: Partial<ReservaDTO> = {
      idCliente: idCliente,
      nombreCliente: idCliente ? undefined : this.model.nombreCliente,
      apellidoCliente: idCliente ? undefined : this.model.apellidoCliente,
      telefonoCliente: idCliente ? undefined : this.model.telefonoCliente,
      emailCliente: idCliente ? undefined : this.model.emailCliente,
      dniCliente: idCliente ? undefined : this.model.dniCliente,
      fechaHoraReserva: `${this.model.fechaReserva}T${this.model.horaReserva}:00`,
      cantidadPersonas: this.model.numeroPersonas,
      idMesa: this.model.idMesa ? Number(this.model.idMesa) : undefined,
      estado: 'CONFIRMADA'
    };

    console.log("[RECEPCION][ReservaForm] Enviando DTO de reserva final:", dto);

    this.reservaService.crearReserva(dto).subscribe({
      next: (res: ReservaDTO) => {
        console.log("[RECEPCION][ReservaForm] Reserva y Registro completados:", res);
        this.toastService.success('Reserva y Cuenta de Cliente creadas exitosamente');
        this.router.navigate(['/recepcion/reservas']);
      },
      error: (err: HttpErrorResponse) => {
        console.error("[RECEPCION][ReservaForm] Error al crear reserva definitiva:", err);
        const msg = err.error?.message || 'Error al registrar la reserva';
        this.toastService.error(msg);
      }
    });
  }
}
