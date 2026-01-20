import { Component } from '@angular/core';

@Component({
  selector: 'app-photos',
  imports: [],
  templateUrl: './photos-section.html',
})
export class PhotosSection {
  public images = [
    '/assets/images/soulfire1.webp',
    '/assets/images/soulfire2.webp',
    '/assets/images/soulfire3.webp',
    '/assets/images/soulfire4.webp',
    '/assets/images/soulfire5.webp',
    '/assets/images/soulfire6.webp',
    '/assets/images/soulfire7.webp',
    '/assets/images/soulfire8.webp',
  ];

  public isModalOpen = false;
  public selectedImage = '';

  openModal(imageSrc: string): void {
    this.selectedImage = imageSrc;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedImage = '';
  }
}
