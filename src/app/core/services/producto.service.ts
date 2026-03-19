import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoDTO } from '../models/producto.model';

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private apiUrl = `${environment.apiUrl}/productos`;
    private categoriaUrl = `${environment.apiUrl}/categorias`;

    constructor(private http: HttpClient) { }

    getAll(activeOnly?: boolean): Observable<ProductoDTO[]> {
        console.log(`[SERVICE][ProductoService] Solicitando lista de productos (activeOnly: ${activeOnly})...`);
        const params: any = {};
        if (activeOnly !== undefined) params.activeOnly = activeOnly;
        return this.http.get<ProductoDTO[]>(this.apiUrl, { params }).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Productos recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ProductoService] Error al obtener productos:", err)
            })
        );
    }

    getActivos(): Observable<ProductoDTO[]> {
        console.log("[SERVICE][ProductoService] Solicitando productos ACTIVOS...");
        return this.http.get<ProductoDTO[]>(this.apiUrl, { params: { activeOnly: true } }).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Productos activos recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ProductoService] Error al obtener productos activos:", err)
            })
        );
    }

    getPublic(): Observable<ProductoDTO[]> {
        console.log("[SERVICE][ProductoService] Solicitando productos PÚBLICOS para el cliente...");
        return this.http.get<ProductoDTO[]>(`${this.apiUrl}/public`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Productos públicos recibidos:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ProductoService] Error al obtener productos públicos:", err)
            })
        );
    }

    getById(id: number): Observable<ProductoDTO> {
        console.log(`[SERVICE][ProductoService] Solicitando producto con ID: ${id}...`);
        return this.http.get<ProductoDTO>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Producto recibido:", res),
                error: (err) => console.error(`[SERVICE][ProductoService] Error al obtener producto ID ${id}:`, err)
            })
        );
    }

    getByCategoria(idCategoria: number): Observable<ProductoDTO[]> {
        console.log(`[SERVICE][ProductoService] Solicitando productos de la categoría ID: ${idCategoria}...`);
        return this.http.get<ProductoDTO[]>(`${this.apiUrl}/categoria/${idCategoria}`).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Productos por categoría recibidos:", res.length, "items"),
                error: (err) => console.error(`[SERVICE][ProductoService] Error al obtener productos de categoría ID ${idCategoria}:`, err)
            })
        );
    }

    create(producto: Partial<ProductoDTO>): Observable<ProductoDTO> {
        console.log("[SERVICE][ProductoService] Creando nuevo producto:", producto);
        return this.http.post<ProductoDTO>(this.apiUrl, producto).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Producto creado exitosamente:", res),
                error: (err) => console.error("[SERVICE][ProductoService] Error al crear producto:", err)
            })
        );
    }

    update(id: number, producto: Partial<ProductoDTO>): Observable<ProductoDTO> {
        console.log(`[SERVICE][ProductoService] Actualizando producto ID ${id}:`, producto);
        return this.http.put<ProductoDTO>(`${this.apiUrl}/${id}`, producto).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Producto actualizado exitosamente:", res),
                error: (err) => console.error(`[SERVICE][ProductoService] Error al actualizar producto ID ${id}:`, err)
            })
        );
    }

    delete(id: number): Observable<void> {
        console.log(`[SERVICE][ProductoService] Eliminando producto ID: ${id}...`);
        return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
            tap({
                next: () => console.log(`[SERVICE][ProductoService] Producto ID ${id} eliminado satisfactoriamente`),
                error: (err) => console.error(`[SERVICE][ProductoService] Error al eliminar producto ID ${id}:`, err)
            })
        );
    }

    updateStock(id: number, cantidad: number): Observable<void> {
        console.log(`[SERVICE][ProductoService] Actualizando stock del producto ID ${id} a ${cantidad}...`);
        return this.http.patch<void>(`${this.apiUrl}/${id}/stock`, {}, { params: { cantidad: cantidad.toString() } }).pipe(
            tap({
                next: () => console.log(`[SERVICE][ProductoService] Stock del producto ID ${id} actualizado`),
                error: (err) => console.error(`[SERVICE][ProductoService] Error al actualizar stock del producto ID ${id}:`, err)
            })
        );
    }

    // Categorias
    getCategorias(): Observable<any[]> {
        console.log("[SERVICE][ProductoService] Solicitando lista de categorías...");
        return this.http.get<any[]>(this.categoriaUrl).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Categorías recibidas:", res.length, "items"),
                error: (err) => console.error("[SERVICE][ProductoService] Error al obtener categorías:", err)
            })
        );
    }

    createCategoria(categoria: any): Observable<any> {
        console.log("[SERVICE][ProductoService] Creando nueva categoría:", categoria);
        return this.http.post<any>(this.categoriaUrl, categoria).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Categoría creada exitosamente:", res),
                error: (err) => console.error("[SERVICE][ProductoService] Error al crear categoría:", err)
            })
        );
    }

    updateCategoria(id: number, categoria: any): Observable<any> {
        console.log(`[SERVICE][ProductoService] Actualizando categoría ID ${id}:`, categoria);
        return this.http.put<any>(`${this.categoriaUrl}/${id}`, categoria).pipe(
            tap({
                next: (res) => console.log("[SERVICE][ProductoService] Categoría actualizada exitosamente:", res),
                error: (err) => console.error(`[SERVICE][ProductoService] Error al actualizar categoría ID ${id}:`, err)
            })
        );
    }

    deleteCategoria(id: number): Observable<void> {
        console.log(`[SERVICE][ProductoService] Eliminando categoría ID: ${id}...`);
        return this.http.delete<void>(`${this.categoriaUrl}/${id}`).pipe(
            tap({
                next: () => console.log(`[SERVICE][ProductoService] Categoría ID ${id} eliminada satisfactoriamente`),
                error: (err) => console.error(`[SERVICE][ProductoService] Error al eliminar categoría ID ${id}:`, err)
            })
        );
    }
}
