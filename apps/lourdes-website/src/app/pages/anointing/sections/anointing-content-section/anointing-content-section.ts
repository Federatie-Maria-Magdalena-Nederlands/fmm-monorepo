import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-anointing-content-section',
  imports: [...COMPONENTS],
  templateUrl: './anointing-content-section.html',
})
export class AnointingContentSection {}
