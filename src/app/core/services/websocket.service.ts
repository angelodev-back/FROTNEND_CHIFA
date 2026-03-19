/**
 * ARCHIVO DEPRECADO - Mantenido para compatibilidad de imports.
 * El servicio WebSocket real ahora vive en ws.service.ts (WsService).
 * 
 * Si algún componente importaba WebSocketService, cámbialo por WsService.
 * Este re-export permite una migración gradual sin romper compilación.
 */
export { WsService as WebSocketService } from './ws.service';
