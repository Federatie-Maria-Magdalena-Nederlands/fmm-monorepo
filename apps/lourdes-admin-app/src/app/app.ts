import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Sidebar } from './shared/components/sidebar/sidebar';
import { AuthService } from './shared/services/auth.service';
import { Header } from "./shared/components/header/header";

@Component({
  imports: [CommonModule, RouterModule, Sidebar, Header],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'lourdes-admin-app';
  protected authService = inject(AuthService);
  protected router = inject(Router);
  public isAuthenticated: boolean = false;

  constructor() {
    this.authService.currentUser$.subscribe((user) => {
      if(user) {
        this.isAuthenticated = true;
        this.router.navigate(['/dashboard']);
      } else {
        this.isAuthenticated = false;
      }

    });
  }
}
