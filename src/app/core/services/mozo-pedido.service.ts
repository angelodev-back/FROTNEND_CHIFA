import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PedidoDTO } from '../models/pedido.model';

@Injectable({
    providedIn: 'root'
})
export class MozoPedidoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/mozo/pedidos`;

   getMisPedidos(estado?: string): Observable<any[]> {
      const params: Record<string, string> = {};
      if (estado) params['estado'] = estado;
      return this.http.get<any[]>(this.apiUrl, { params });
   }

   getPedidoByMesaNumero(numero: number): Observable<any> {
      console.log(`[SERVICE][MozoPedidoService] Buscando pedido activo para mesa #${numero}...`);
      return this.http.get<any>(`${this.apiUrl}/mesa/${numero}`);
   }

    marcarComoServido(idPedido: number): Observable<PedidoDTO> {
        return this.http.patch<PedidoDTO>(`${this.apiUrl}/${idPedido}/servir`, {});
    }

    getActivoPorMesa(idMesa: number): Observable<PedidoDTO> {
        return this.http.get<PedidoDTO>(`${this.apiUrl}/mesa/${idMesa}/activo`);
    }
}
