import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, of, repeat, shareReplay, timer, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  private _isOffline = signal<boolean>(false);
  
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private monitoringStarted = false;

  // Public signal for components
  readonly isOffline = this._isOffline.asReadonly();

  setOffline(status: boolean) {
    if (this._isOffline() !== status) {
      this._isOffline.set(status);
    }
  }

  /**
   * Monitor backend health periodically
   */
  startMonitoring() {
    if (this.monitoringStarted) return;
    this.monitoringStarted = true;

    // Ping every 4 seconds for faster detection
    timer(0, 4000).pipe(
      switchMap(() => this.http.get(`${this.apiUrl}/public/restaurante`, { observe: 'response' }).pipe(
        catchError((error) => {
          console.warn('[SERVER-STATUS] Health check failed:', error);
          // If we get an error that isn't a normal API response, consider it offline
          // Especially Status 0 (CORS/Network), 5xx (Server Error), or 404 on a required endpoint
          if (error.status === 0 || error.status >= 500 || error.status === 404) {
            this.setOffline(true);
          }
          return of({ status: -1 }); // Custom offline marker
        })
      ))
    ).subscribe(resp => {
      if (resp && resp.status >= 200 && resp.status < 300) {
        console.log('[SERVER-STATUS] Backend is ONLINE');
        this.setOffline(false);
      } else {
        // If status is -1 or any other non-success, we don't set it online
        // The catchError already handles setting offline:true
      }
    });
  }
}
