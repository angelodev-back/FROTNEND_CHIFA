import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarClientComponent } from '../../components/navbar-client/navbar-client.component';

@Component({
    selector: 'app-client-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, NavbarClientComponent],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})
export class ClientLayoutComponent { }
