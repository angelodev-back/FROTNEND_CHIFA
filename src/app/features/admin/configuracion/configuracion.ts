import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionService } from '../../../core/services/configuracion.service';
import { ToastService } from '../../../core/services/toast.service';
import { RestauranteInfo } from '../../../core/services/public.service';

@Component({
  selector: 'app-admin-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class AdminConfiguracion implements OnInit {
  private configService = inject(ConfiguracionService);
  private toastService = inject(ToastService);

  activeTab: 'general' | 'horarios' | 'pagos' | 'sistema' = 'general';
  loading = signal(false);
  saved = false;

  info: any = {
    nombre: '',
    ruc: '',
    direccion: '',
    telefono: '',
    email: '',
    horario: '',
    aforo: 120,
    descripcion: ''
  };

  horarios = [
    { dia: 'Lunes', activo: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Martes', activo: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Miércoles', activo: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Jueves', activo: true, apertura: '12:00', cierre: '23:00' },
    { dia: 'Viernes', activo: true, apertura: '12:00', cierre: '00:00' },
    { dia: 'Sábado', activo: true, apertura: '12:00', cierre: '00:00' },
    { dia: 'Domingo', activo: true, apertura: '12:00', cierre: '22:00' }
  ];

  pagos = {
    efectivo: true,
    yape: true,
    plin: true,
    tarjeta: false,
    transferencia: false
  };

  ngOnInit() {
    console.log("[ADMIN][Configuracion] Inicializando componente de configuración del sistema...");
    this.cargar();
  }

  cargar() {
    console.log("[ADMIN][Configuracion][cargar] Solicitando configuración actual...");
    this.loading.set(true);
    this.configService.getConfig().subscribe({
      next: (data: any) => {
        console.log("[ADMIN][Configuracion][cargar] Configuración cargada exitosamente:", data);
        this.info = data;
        this.loading.set(false);
      },
      error: (err) => {
        console.error("[ADMIN][Configuracion][cargar] Error al cargar configuración:", err);
        this.toastService.error('Error al cargar configuración');
        this.loading.set(false);
      }
    });
  }

  onSave() {
    try {
      console.log("[ADMIN][Configuracion][onSave] Intentando guardar cambios en la configuración...", this.info);
      this.loading.set(true);
      this.configService.updateConfig(this.info).subscribe({
        next: (res: any) => {
          console.log("[ADMIN][Configuracion][onSave] Configuración guardada con éxito:", res);
          this.info = res;
          this.saved = true;
          setTimeout(() => this.saved = false, 3000);
          this.toastService.success('Configuración guardada correctamente');
          this.loading.set(false);
        },
        error: (err) => {
          console.error("[ADMIN][Configuracion][onSave] Error al guardar configuración:", err);
          this.toastService.error('Error al guardar cambios');
          this.loading.set(false);
        }
      });
    } catch (error) {
      console.error("[ADMIN][Configuracion][onSave] Error crítico inesperado:", error);
      this.toastService.error("Ocurrió un error inesperado al guardar");
      this.loading.set(false);
    }
  }
}
