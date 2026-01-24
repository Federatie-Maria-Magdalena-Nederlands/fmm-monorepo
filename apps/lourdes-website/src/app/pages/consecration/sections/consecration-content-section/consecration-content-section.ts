import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-consecration-content-section',
  imports: [...COMPONENTS],
  templateUrl: './consecration-content-section.html',
})
export class ConsecrationContentSection {}
