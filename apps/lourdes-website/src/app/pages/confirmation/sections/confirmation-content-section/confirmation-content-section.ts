import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';

const COMPONENTS = [AbstractBackground];

@Component({
  selector: 'app-confirmation-content-section',
  imports: [...COMPONENTS],
  templateUrl: './confirmation-content-section.html',
})
export class ConfirmationContentSection {}
