import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-join-community-section',
  imports: [RouterModule],
  templateUrl: './join-community-section.html',
})
export class JoinCommunitySection {
  public router = inject(Router);

  public joinUs() {
    this.router.navigate(['/volunteer']);
  }

}
