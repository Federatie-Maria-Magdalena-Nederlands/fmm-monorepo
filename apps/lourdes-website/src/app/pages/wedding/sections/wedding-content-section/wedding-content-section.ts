import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-wedding-content-section',
  imports: [...COMPONENTS],
  templateUrl: './wedding-content-section.html',
})
export class WeddingContentSection {}
