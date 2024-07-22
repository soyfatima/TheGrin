import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserLoginComponent } from '../dialog/user-login/user-login.component';
import { MatDialog } from '@angular/material/dialog';

declare var google: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {
  isNavbarCollapsed = true;
  isMapOpen = false;
  showHomeNavbar = true;
  showOtherNavbar = false;
  showStoreNavbar = false;
  currentRoute: string = '';
  activeNavbarType: string = '';

  isDropdownOpen: boolean = false;
  IsUserLogged: boolean = false;
  showLoginPopup: boolean = false;
  tab = 'login';
  activeTab: string = 'login';
  loggedInUser: any;
  signupForm!: FormGroup;
  loginForm!: FormGroup;
  data: any
  usernameErrorMessage: string | null = null;
  userErrorMessage: string | null = null;
  emailErrorMessage: string | null = null;
  userCart: any;

  constructor(private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,

  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.determineNavbarVariant(event.url);
      }
    });
  }

 ngOnInit(){
  

    this.googleTranslateElementInit();
  }


  googleTranslateElementInit() {
    new google.translate.TranslateElement({ pageLanguage: 'fr' }, 'google_translate_element');
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  determineNavbarVariant(url: string) {
    if (url.includes('/homepage')) {
      this.showHomeNavbar = true;
      this.showOtherNavbar = false;
      this.showStoreNavbar = false;
      this.activeNavbarType = 'home';
    } else if (url.includes('/chat')) {
      this.showHomeNavbar = false;
      this.showOtherNavbar = true;
      this.showStoreNavbar = false;
      this.activeNavbarType = 'other';
    } 
  }

  switchToOtherNavbar() {
    this.showHomeNavbar = false;
    this.showOtherNavbar = true;
    this.showStoreNavbar = false;
    this.activeNavbarType = 'other';
  }

  switchToHomeNavbar() {
    this.showHomeNavbar = true;
    this.showOtherNavbar = false;
    this.showStoreNavbar = false;
    this.activeNavbarType = 'home';
  }
  // Method to switch to Store Navbar
  switchToStoreNavbar() {
    this.showHomeNavbar = false;
    this.showOtherNavbar = false;
    this.showStoreNavbar = true;
    this.activeNavbarType = 'store';

  }

  toggleMap() {
    this.isMapOpen = !this.isMapOpen;
  }
  closeMap() {
    this.isMapOpen = false;
  }
 
  loginUser(): void {
    this.dialog.open(UserLoginComponent, {
      width: '400px',
      data: { }
    });
  this.showLoginPopup=false;
}
}