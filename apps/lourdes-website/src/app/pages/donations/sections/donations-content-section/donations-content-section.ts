import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-donations-content-section',
  imports: [...COMPONENTS],
  templateUrl: './donations-content-section.html',
})
export class DonationsContentSection {}
