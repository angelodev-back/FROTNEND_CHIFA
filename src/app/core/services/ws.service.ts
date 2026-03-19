import { Injectable, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface WsMessage {
  topic: string;
  body: any;
}

/**
 * Servicio WebSocket STOMP unificado.
 * Reemplaza tanto websocket.service.ts como la versión anterior de ws.service.ts.
 * Incluye: autenticación JWT en headers, cola de suscripciones pendientes,
 * reconexión automática, y observables filtrados por topic.
 */
@Injectable({ providedIn: 'root' })
export class WsService implements OnDestroy {
  private client!: Client;
  private connected = false;
  private messageSubject = new Subject<WsMessage>();
  private pendingSubscriptions: string[] = [];

  constructor(private auth: AuthService) { }

  connect(): void {
    if (this.client && this.client.active) return;

    const token = this.auth.getToken();
    const wsUrl = environment.wsUrl || 'http://localhost:8080/ws';

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        console.log('✅ WebSocket STOMP conectado');
        // Procesar suscripciones que llegaron antes de conectar
        this.pendingSubscriptions.forEach(topic => this.doSubscribe(topic));
        this.pendingSubscriptions = [];
      },
      onStompError: (err: any) => {
        this.connected = false;
        console.error('❌ STOMP Error:', err);
      },
      onWebSocketClose: () => {
        this.connected = false;
        console.warn('⚠️ WebSocket cerrado');
      }
    });

    this.client.activate();
  }

  private doSubscribe(topic: string): void {
    if (!this.client || !this.client.connected) return;
    this.client.subscribe(topic, (msg: IMessage) => {
      try {
        this.messageSubject.next({ topic, body: JSON.parse(msg.body) });
      } catch {
        this.messageSubject.next({ topic, body: msg.body });
      }
    });
  }

  /**
   * Suscribirse a un topic STOMP.
   * Devuelve Observable<any> filtrado solo para ese topic.
   * Si no hay conexión, encola el topic y se suscribe al conectar.
   */
  subscribe(topic: string): Observable<any> {
    if (!this.client || !this.client.active) {
      this.connect();
    }

    if (this.connected) {
      this.doSubscribe(topic);
    } else {
      if (!this.pendingSubscriptions.includes(topic)) {
        this.pendingSubscriptions.push(topic);
      }
    }

    return this.messageSubject.asObservable().pipe(
      filter(msg => msg.topic === topic),
      map(msg => msg.body)
    );
  }

  /**
   * Observa TODOS los mensajes de CUALQUIER topic (para componentes que manejan múltiples topics).
   */
  getAll(): Observable<WsMessage> {
    return this.messageSubject.asObservable();
  }

  disconnect(): void {
    if (this.client && this.client.active) {
      this.client.deactivate().then(() => {
        this.connected = false;
      });
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
