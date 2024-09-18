import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
declare var google: any;
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Router, NavigationEnd } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'theGrin';

  private currentSection: any;
  isMapOpen: boolean = false;
  emailPrompt: boolean = false;

  constructor(private router: Router, private renderer: Renderer2, private elementRef: ElementRef) { }

  ngOnInit(): void {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

  }

  //navbar scroll
  @HostListener('window:scroll', [])
  checkScroll() {
    const navbar = document.querySelector('.navbar');
    const globalNav = document.querySelector('.global-nav');
    if (navbar) {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (scrollPosition > 50) {
        navbar.classList.add(prefersDarkMode ? 'bg-dark' : 'bg-light');
        navbar.classList.remove(prefersDarkMode ? 'bg-light' : 'bg-dark');

      } else {
        navbar.classList.remove('bg-dark', 'bg-light');
      }

      if (prefersDarkMode) {
        navbar.classList.add('text-light');
        navbar.classList.remove('text-dark');
      } else {
        navbar.classList.remove('text-light');
        navbar.classList.add('text-dark');
      }
    }

    if (globalNav) {
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (scrollPosition > 50) {
        globalNav.classList.add('scrolled');
      } else {
        globalNav.classList.remove('scrolled');
        globalNav.classList.add(prefersDarkMode ? 'dark-mode' : 'light-mode');
        globalNav.classList.add('at-top');
      }
    }

    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.menu a');
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= (sectionTop - sectionHeight / 4)) {
        this.currentSection = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href')?.includes(this.currentSection)) {
        link.classList.add('active');
      }
    });
  }



  ngAfterViewInit() {
    setTimeout(() => {
      this.initAOS();
    }, 2000);
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor = '';

  }

  initAOS() {
    AOS.init();
  }


}