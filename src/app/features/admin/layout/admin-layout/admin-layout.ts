import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit {
  authService = inject(AuthService);
  userRole = '';
  activeMenu = 'Dashboard';

  ngOnInit() {
    // Get the role from auth service
    const user = this.authService.getCurrentUser() as any;
    this.userRole = user?.role || 'ADMIN';
  }

  onMenuChange(menu: string) {
    this.activeMenu = menu;
  }
}

