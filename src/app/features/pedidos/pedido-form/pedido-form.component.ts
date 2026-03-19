import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProductoService } from '../../../core/services/producto.service';
import { MesaService } from '../../../core/services/mesa.service';
import { ProductoDTO } from '../../../core/models/producto.model';
import { MesaDTO } from '../../../core/models/mesa.model';

@Component({
    selector: 'app-pedido-form',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './pedido-form.component.html',
    styleUrl: './pedido-form.component.css'
})
export class PedidoFormComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private pedidoService = inject(PedidoService);
    private productoService = inject(ProductoService);
    private mesaService = inject(MesaService);

    idMesa: number = 0;
    mesa: MesaDTO | null = null;
    productos: ProductoDTO[] = [];
    detalles: any[] = [];
    tipoPedido: string = 'SALON';
    observaciones: string = '';

    loading = true;
    submitting = false;

    ngOnInit(): void {
        this.idMesa = Number(this.route.snapshot.paramMap.get('id'));
        this.cargarDatos();
    }

    cargarDatos(): void {
        this.mesaService.getAll().subscribe(mesas => {
            this.mesa = mesas.find(m => m.idMesa === this.idMesa) || null;
        });

        this.productoService.getAll().subscribe({
            next: (data) => {
                this.productos = data.filter(p => p.estado && p.stock > 0);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    agregarProducto(producto: ProductoDTO): void {
        const existe = this.detalles.find(d => d.idProducto === producto.idProducto);
        if (existe) {
            this.incrementarCantidad(this.detalles.indexOf(existe));
        } else {
            this.detalles.push({
                idProducto: producto.idProducto,
                nombreProducto: producto.nombre,
                precioUnitario: producto.precio,
                cantidad: 1,
                observacion: ''
            });
        }
    }

    incrementarCantidad(index: number): void {
        const detalle = this.detalles[index];
        const productoOriginal = this.productos.find(p => p.idProducto === detalle.idProducto);

        if (productoOriginal && detalle.cantidad < productoOriginal.stock) {
            detalle.cantidad++;
        } else {
            alert('No hay más stock disponible para este producto');
        }
    }

    decrementarCantidad(index: number): void {
        if (this.detalles[index].cantidad > 1) {
            this.detalles[index].cantidad--;
        } else {
            this.eliminarDetalle(index);
        }
    }

    eliminarDetalle(index: number): void {
        this.detalles.splice(index, 1);
    }

    calcularTotal(): number {
        return this.detalles.reduce((acc, current) => acc + (current.cantidad * current.precioUnitario), 0);
    }

    guardarPedido(): void {
        if (this.detalles.length === 0) {
            alert('Debes agregar al menos un producto al pedido');
            return;
        }

        this.submitting = true;
        const pedidoRequest = {
            idMesa: this.idMesa,
            tipoPedido: this.tipoPedido,
            observaciones: this.observaciones,
            detalles: this.detalles.map(d => ({
                idProducto: d.idProducto,
                cantidad: d.cantidad,
                observacion: d.observacion
            }))
        };

        this.pedidoService.crearPedido(pedidoRequest).subscribe({
            next: () => {
                this.router.navigate(['/mesas']);
            },
            error: (err: HttpErrorResponse) => {
                alert('Error al crear el pedido: ' + (err.error?.message || 'Error desconocido'));
                this.submitting = false;
            }
        });
    }
}
