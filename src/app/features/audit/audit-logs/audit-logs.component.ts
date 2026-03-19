import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../../core/services/audit.service';
import { AuditLogDTO } from '../../../core/models/audit.model';

@Component({
    selector: 'app-audit-logs',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './audit-logs.component.html',
    styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
    private auditService = inject(AuditService);

    logs: AuditLogDTO[] = [];
    loading = true;
    error = '';

    filtroModulo = '';
    filtroAccion = '';

    pageSize = 10;
    currentPage = 1;
    Math = Math;

    ngOnInit(): void {
        this.cargarLogs();
    }

    cargarLogs(): void {
        this.loading = true;
        this.auditService.getAll().subscribe({
            next: (data) => {
                this.logs = data;
                this.loading = false;
            },
            error: () => {
                this.error = 'Error al cargar los registros de auditoría';
                this.loading = false;
            }
        });
    }

    onPageSizeChange(event: any) {
        this.pageSize = Number(event.target.value);
        this.currentPage = 1;
    }

    onModuloChange() {
        this.currentPage = 1;
    }

    onAccionChange() {
        this.currentPage = 1;
    }

    getFilteredDocs(): AuditLogDTO[] {
        return this.logs.filter(log => {
            const matchModulo = this.filtroModulo ? log.modulo === this.filtroModulo : true;
            const matchAccion = this.filtroAccion ? log.accion.toUpperCase().includes(this.filtroAccion.toUpperCase()) : true;
            return matchModulo && matchAccion;
        }).sort((a, b) => b.id - a.id);
    }

    getPaginatedLogs(): AuditLogDTO[] {
        const list = this.getFilteredDocs();
        const start = (this.currentPage - 1) * this.pageSize;
        return list.slice(start, start + this.pageSize);
    }

    getTotalPages(): number {
        return Math.ceil(this.getFilteredDocs().length / this.pageSize);
    }

    nextPage() {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }
}
