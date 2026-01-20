import { Component } from '@angular/core';
import { AbstractBackground } from '../../../../shared/components/abstract-background/abstract-background';
import { SparkIcon } from '../../../../shared/components/icons/spark-icon';
import { BookOpenIcon } from '../../../../shared/components/icons/book-open-icon';

const COMPONENTS = [AbstractBackground, SparkIcon, BookOpenIcon];

@Component({
  selector: 'app-about-magazine-section',
  imports: [...COMPONENTS, BookOpenIcon],
  templateUrl: './about-magazine-section.html',
})
export class AboutMagazineSection {
  public magazines = [
    {
      name: 'MMM No 7.',
      date: 'September 2025',
    },
    {
      name: 'MMM No 8.',
      date: 'October 2025',
    },
    {
      name: 'MMM No 9.',
      date: 'December 2025 / January 2026',
    },
  ];
}
