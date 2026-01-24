import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-mass-intentions-content-section',
  imports: [...COMPONENTS],
  templateUrl: './mass-intentions-content-section.html',
})
export class MassIntentionsContentSection {}
