import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MENU_ITEMS } from '../../constants/menu-items';
import { MenuItem } from '../../models/interfaces/menu-item.interface';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit, OnDestroy {
  routeItems: MenuItem[] = MENU_ITEMS;

  private scrollListener: (() => void) | null = null;

  ngOnInit() {
    this.initializeScrollTriggerAnimations();
    this.initializeNavbarScroll();
    this.initializeDropdownHandlers();
  }

  private initializeScrollTriggerAnimations() {
    const animatedElements = document.querySelectorAll('[data-scroll-animate]');

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

  private initializeDropdownHandlers() {
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      const allDetails = document.querySelectorAll('nav details');

      allDetails.forEach((detail) => {
        detail.addEventListener('toggle', (event) => {
          const targetDetail = event.target as HTMLDetailsElement;

          // If this dropdown is being opened, close all others
          if (targetDetail.open) {
            allDetails.forEach((otherDetail) => {
              if (
                otherDetail !== targetDetail &&
                (otherDetail as HTMLDetailsElement).open
              ) {
                (otherDetail as HTMLDetailsElement).open = false;
              }
            });
          }
        });
      });
    }, 0);
  }

  public closeAllDropdowns() {
    // Close all <details> elements (dropdowns)
    const allDetails = document.querySelectorAll('details[open]');
    allDetails.forEach((detail) => {
      detail.removeAttribute('open');
    });

    // Close mobile menu dropdown by removing focus
    const dropdownToggle = document.querySelector(
      '.dropdown [tabindex="0"]',
    ) as HTMLElement;
    if (dropdownToggle) {
      dropdownToggle.blur();
    }
  }

  ngOnDestroy() {
    // Clean up scroll listener
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }
}
