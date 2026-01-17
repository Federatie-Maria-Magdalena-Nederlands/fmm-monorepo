import { Component, OnInit, OnDestroy } from '@angular/core';
import { Hero } from '../../shared/components/hero/hero';
import { Timeline } from '../../shared/components/timeline/timeline';

const COMPONENTS = [Hero, Timeline];

@Component({
  selector: 'app-home',
  imports: [...COMPONENTS],
  templateUrl: './home.html',
})
export class Home implements OnInit, OnDestroy {
  private scrollListener: (() => void) | null = null;
  private carouselInterval: any;

  ngOnInit() {
    this.initializeScrollTriggerAnimations();
    this.initializeNavbarScroll();
  }

  private initializeScrollTriggerAnimations() {
    const animatedElements = document.querySelectorAll(
      '[data-scroll-animate]'
    );

    if (!animatedElements.length) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-triggered');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach((element) => {
      observer.observe(element);
    });
  }

  private initializeNavbarScroll() {
    const navbar = document.querySelector('nav');
    if (!navbar) return;

    const handleScroll = () => {
      console.log(window.scrollY);
      if (window.scrollY > 0) {
        navbar.classList.add('bg-white', 'shadow-lg', 'text-black');
        navbar.classList.remove('bg-transparent', 'text-white');
      } else {
        navbar.classList.remove('bg-white', 'shadow-lg', 'text-black');
        navbar.classList.add('bg-transparent', 'text-white');
      }
    };

    window.addEventListener('scroll', handleScroll);
    this.scrollListener = handleScroll;
  }


  ngOnDestroy() {
    // Clean up scroll listener
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    // Clean up carousel interval
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
}
