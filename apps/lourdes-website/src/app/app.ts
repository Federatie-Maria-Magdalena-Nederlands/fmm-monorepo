import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterModule } from '@angular/router';
import { Footer } from './shared/components/footer/footer';
import { Navbar } from './shared/components/navbar/navbar';

const COMPONENTS = [Footer, Navbar];
@Component({
  imports: [RouterModule, ...COMPONENTS],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  public router = inject(Router);
  protected title = 'lourdes-website';
  isNotFoundPage = false;

  ngOnInit() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isNotFoundPage =
          event.urlAfterRedirects.includes('not-found') ||
          event.urlAfterRedirects === '/404';
      });
  }
}
