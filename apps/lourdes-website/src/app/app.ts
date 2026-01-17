import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from "./shared/components/footer/footer";
import { Navbar } from './shared/components/navbar/navbar';


const COMPONENTS = [Footer, Navbar];
@Component({
  imports: [RouterModule, ...COMPONENTS],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'lourdes-website';
}
