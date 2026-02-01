import { Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../shared/services/firestore.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {
  private firestoreService = inject(FirestoreService);
  private router = inject(Router);

  public totalSacraments = signal<number>(0);
  public totalDonations = signal<number>(0);
  public totalApprovedMembers = signal<number>(0);
  public loading = signal<boolean>(true);

  async ngOnInit(): Promise<void> {
    await this.loadStatistics();
  }

  async loadStatistics(): Promise<void> {
    this.loading.set(true);
    try {
      // Fetch all data

      const sacraments = await this.firestoreService.getAllSacramentSubmissions();
      const donations = await this.firestoreService.getAllDonations();
      const members = await this.firestoreService.getAllMembers();

      this.totalSacraments.set(sacraments.length);
      this.totalDonations.set(donations.length);
      this.totalApprovedMembers.set(members.length);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      this.loading.set(false);
    }
  }

  public redirect(path: string): void {
    this.router.navigate([path]);
  }
}
