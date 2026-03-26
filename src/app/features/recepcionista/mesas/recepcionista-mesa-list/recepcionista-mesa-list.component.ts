import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MesaService } from '../../../../core/services/mesa.service';
import { Mesa } from '../../../../core/models/mesa.model';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Usuario } from '../../../../core/models/usuario.model';
import { ReservaService } from '../../../../core/services/reserva.service';
import { PedidoService } from '../../../../core/services/pedido.service';
import { WsService } from '../../../../core/services/ws.service';
import { CajaService } from '../../../../core/services/caja.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-recepcionista-mesa-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ModalComponent, EmptyStateComponent],
  templateUrl: './recepcionista-mesa-list.component.html',
  styleUrl: './recepcionista-mesa-list.component.css'
})
export class RecepcionistaMesaListComponent implements OnInit {
  private mesaService = inject(MesaService);
  private usuarioService = inject(UsuarioService);
  private reservaService = inject(ReservaService);
  private pedidoService = inject(PedidoService);
  private wsService = inject(WsService);
  private cajaService = inject(CajaService);

  mesas: Mesa[] = [];
  allClientes: Usuario[] = [];
  clientesFiltrados: Usuario[] = [];
  loading = true;
  dnisOcupados = new Set<string>();

  // Filtro de Visibilidad - Simplificado según requerimiento (DISPONIBLE, OCUPADA, EN_LIMPIEZA)
  showOnlyAvailable = signal(true);
  mesasVisibles = computed(() => {
    const validStates = ['DISPONIBLE', 'OCUPADA', 'EN_LIMPIEZA'];
    const baseMesas = this.mesas.filter(m => validStates.includes(m.estado));
    
    if (this.showOnlyAvailable()) {
      return baseMesas.filter(m => m.estado === 'DISPONIBLE');
    }
    return baseMesas;
  });

  // Modal State
  showModal = signal(false);
  showDetailModal = signal(false);
  selectedMesa = signal<any>(null);
  
  // Client selection state
  isNewClient = signal(false);
  selectedClientId = signal<number | null>(null);
  searchTerm = signal('');

  clientData = {
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    celular: '',
    idRol: 1
  };
  isSaving = signal(false);

  ngOnInit(): void {
    console.log("[RECEPCION][MesaList] Inicializando plano de mesas...");
    this.cargarMesas();
    this.cargarClientes();
    this.cargarDatosOcupacion();
    this.setupWebSocket();
  }

  setupWebSocket(): void {
    this.wsService.subscribe('/topic/mesas').subscribe({
      next: () => this.cargarMesas()
    });
    this.wsService.subscribe('/topic/pedidos/estado').subscribe({
      next: () => this.cargarDatosOcupacion()
    });
  }

  cargarClientes(): void {
    this.usuarioService.getClientes().subscribe({
      next: (data) => {
        this.allClientes = data;
        this.onSearchChange(); 
      },
      error: (err) => console.error("[RECEPCION][MesaList] Error al cargar clientes:", err)
    });
  }

  cargarDatosOcupacion(): void {
    this.dnisOcupados.clear();
    const hoy = new Date().toISOString().split('T')[0];
    
    this.reservaService.getByFecha(hoy).subscribe(reservas => {
      reservas.filter(r => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA')
              .forEach(r => { if(r.dniCliente) this.dnisOcupados.add(r.dniCliente); });
      this.onSearchChange();
    });

    this.pedidoService.getActivos().subscribe(pedidos => {
      pedidos.forEach(p => { if(p.dniCliente) this.dnisOcupados.add(p.dniCliente); });
      this.onSearchChange();
    });
  }

  private updateBusyness(): void {
    this.mesas.forEach(m => {
      if (m.estado === 'OCUPADA' && m.dniCliente) {
        this.dnisOcupados.add(m.dniCliente);
      }
    });
    this.onSearchChange();
  }

  onSearchChange(): void {
    const term = this.searchTerm().toLowerCase().trim();
    this.clientesFiltrados = this.allClientes.filter(c => {
      const matchSearch = !term || 
        c.nombres.toLowerCase().includes(term) || 
        c.apellidos.toLowerCase().includes(term) || 
        (c.dni && c.dni.includes(term));
      
      const isBusy = c.dni && this.dnisOcupados.has(c.dni);
      
      return matchSearch && !isBusy;
    });
  }

  cargarMesas(): void {
    console.log("[RECEPCION][MesaList][cargarMesas] Solicitando estado de mesas...");
    this.loading = true;
    this.mesaService.getAll().subscribe({
      next: (data: Mesa[]) => {
        console.log("[RECEPCION][MesaList][cargarMesas] Mesas cargadas:", data.length);
        this.mesas = data;
        this.loading = false;
        this.updateBusyness();
      },
      error: (err: any) => {
        console.error("[RECEPCION][MesaList][cargarMesas] Error al cargar mesas:", err);
        this.loading = false;
      }
    });
  }

  asignarMesa(m: any): void {
    console.log(`[RECEPCION][MesaList][asignarMesa] Abriendo modal para mesa ${m.numero || m.numeroMesa}`);
    this.selectedMesa.set(m);
    this.isNewClient.set(false);
    this.selectedClientId.set(null);
    this.searchTerm.set('');
    this.clientData = {
      nombres: '',
      apellidos: '',
      dni: '',
      email: '',
      celular: '',
      idRol: 1
    };
    this.showModal.set(true);
    this.onSearchChange();
  }

  cerrarModal(): void {
    this.showModal.set(false);
    this.selectedMesa.set(null);
  }

  confirmarAsignacion(): void {
    const mesa = this.selectedMesa();
    if (!mesa) return;

    if (this.isNewClient()) {
      this.registrarYAsignar(mesa);
    } else {
      this.asignarClienteExistente(mesa);
    }
  }

  registrarYAsignar(mesa: any): void {
    if (!this.clientData.nombres || !this.clientData.email || !this.clientData.dni) {
      alert("Por favor, complete nombre, email y DNI del cliente");
      return;
    }

    this.isSaving.set(true);
    this.usuarioService.registrarClienteRapido({
      ...this.clientData,
      password: this.clientData.dni, 
      idRol: 1 
    }).subscribe({
      next: (nuevoCliente) => {
        console.log("[RECEPCION][MesaList] Cliente registrado:", nuevoCliente);
        this.allClientes.push(nuevoCliente);
        this.procederAsignacion(mesa, nuevoCliente);
      },
      error: (err) => {
        console.error("[RECEPCION][MesaList] Error al registrar cliente:", err);
        if (err.status === 400 && err.error?.message?.includes("ya está registrado")) {
          const clienteExistente = this.allClientes.find(c => c.email === this.clientData.email || c.dni === this.clientData.dni);
          if (clienteExistente) {
            this.procederAsignacion(mesa, clienteExistente);
          } else {
            alert("El cliente ya está registrado. Por favor, búsquelo en la pestaña 'Cliente Registrado'");
            this.isNewClient.set(false);
            this.cargarClientes();
            this.isSaving.set(false);
          }
        } else {
          alert("Error al registrar cliente: " + (err.error?.message || 'Email o DNI duplicado'));
          this.isSaving.set(false);
        }
      }
    });
  }

  asignarClienteExistente(mesa: any): void {
    if (!this.selectedClientId()) {
      alert("Por favor, seleccione un cliente");
      return;
    }

    const cliente = this.allClientes.find(c => c.idUsuario === this.selectedClientId());
    if (!cliente) return;

    this.isSaving.set(true);
    this.procederAsignacion(mesa, cliente);
  }

  private procederAsignacion(mesa: any, cliente: Usuario): void {
    const updateData: any = {
      ...mesa,
      estado: 'OCUPADA',
      nombreCliente: `${cliente.nombres} ${cliente.apellidos}`,
      dniCliente: cliente.dni,
      capacidad: mesa.capacidad
    };

    this.mesaService.update(mesa.idMesa || mesa.id, updateData).subscribe({
      next: () => {
        console.log("[RECEPCION][MesaList] Mesa asignada con éxito");
        this.cerrarModal();
        this.cargarMesas();
      },
      error: (err) => {
        console.error("[RECEPCION][MesaList] Error al asignar mesa:", err);
        this.isSaving.set(false);
      }
    });
  }

  verDetalle(m: any): void {
    console.log(`[RECEPCION][MesaList][verDetalle] Consultando detalle de mesa ${m.numeroMesa || m.numero}`);
    this.selectedMesa.set(m);
    this.showDetailModal.set(true);
  }

  cerrarDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedMesa.set(null);
  }

  toggleVisibility(): void {
    this.showOnlyAvailable.set(!this.showOnlyAvailable());
  }

  confirmarPago(mesa: any): void {
    if (!mesa) return;
    
    // Buscar pedido activo para esta mesa
    this.pedidoService.getActivoPorMesa(mesa.idMesa || mesa.id).subscribe({
      next: (pedido: any) => {
        if (!pedido) {
          alert("No se encontró un pedido activo para esta mesa");
          return;
        }

        const metodo = prompt("Ingrese método de pago (EFECTIVO, TARJETA, YAPE, PLIN):", "EFECTIVO");
        if (!metodo) return;

        this.isSaving.set(true);
        this.pedidoService.confirmarPago(pedido.idPedido, metodo.toUpperCase()).subscribe({
          next: () => {
            alert("Pago procesado con éxito y mesa liberada");
            this.isSaving.set(false);
            this.cargarMesas();
          },
          error: (err: any) => {
            console.error("Error al procesar pago:", err);
            alert("Error al procesar pago: " + (err.error?.message || 'Error desconocido'));
            this.isSaving.set(false);
          }
        });
      },
      error: (err: any) => alert("Error al buscar pedido: " + err.message)
    });
  }
}
