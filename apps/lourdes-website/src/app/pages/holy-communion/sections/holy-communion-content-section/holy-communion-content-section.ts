import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-holy-communion-content-section',
  imports: [...COMPONENTS],
  templateUrl: './holy-communion-content-section.html',
})
export class HolyCommunionContentSection {}
