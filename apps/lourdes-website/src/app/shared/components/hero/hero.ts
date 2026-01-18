import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
})
export class Hero implements AfterViewInit {
  @ViewChild('heroVideo', { static: false }) heroVideo:
    | ElementRef<HTMLVideoElement>
    | undefined;

  ngAfterViewInit() {
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
      this.playVideo();
    }, 500);
  }

  private playVideo() {
    if (!this.heroVideo?.nativeElement) {
      console.warn('Video element not found');
      return;
    }

    const videoElement = this.heroVideo.nativeElement;

    // Ensure video is muted before attempting to play
    videoElement.muted = true;
    videoElement.volume = 0;

    // Try to play the video
    const playAttempt = videoElement.play();

    if (playAttempt !== undefined) {
      playAttempt
        .then(() => {
          console.log('✓ Video is now playing');
          // Unmute after a short delay if desired
          setTimeout(() => {
            videoElement.muted = false;
          }, 1000);
        })
        .catch((error: DOMException) => {
          console.warn('✗ Autoplay failed:', error);
          // Fallback: Add a play button or restart the page
          this.handleAutoplayFailure(videoElement);
        });
    }
  }

  private handleAutoplayFailure(videoElement: HTMLVideoElement) {
    // Try again after a delay
    setTimeout(() => {
      const retryPlay = videoElement.play();
      if (retryPlay !== undefined) {
        retryPlay
          .then(() => {
            console.log('✓ Video is now playing (retry successful)');
          })
          .catch(() => {
            console.error(
              'Video autoplay failed - user interaction may be required',
            );
          });
      }
    }, 1000);
  }
}
