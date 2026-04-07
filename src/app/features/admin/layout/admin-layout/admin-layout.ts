import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarService } from '../../../../core/services/sidebar.service';
import { filter, takeUntil } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  sidebarService = inject(SidebarService);
  destroyRef = inject(DestroyRef);

  userRole = '';
  activeMenu = 'Dashboard';

  ngOnInit() {
    // Get the role from auth service
    const user = this.authService.getCurrentUser() as any;
    this.userRole = user?.role || 'ADMIN';

    // Synchronize initial menu
    this.syncActiveMenu(this.router.url);

    // Subscribe to router events for future changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event: any) => {
      this.syncActiveMenu(event.urlAfterRedirects);
    });
  }

  syncActiveMenu(url: string) {
    const menus = this.sidebarService.getMenu();
    for (const group of menus) {
      const item = group.items.find(i => url.startsWith(i.route));
      if (item) {
        this.activeMenu = item.label;
        return;
      }
    }
  }

  onMenuChange(menu: string) {
    this.activeMenu = menu;
  }
}

