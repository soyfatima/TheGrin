import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { AuthService } from '../../service/auth.service';
// import { TokenService } from '../../service/tokenservice';
// import { CookieService } from 'ngx-cookie-service';
// import { ToastrService } from 'ngx-toastr';
// import { Observable, catchError, map, of } from 'rxjs';
// import { CartService } from '../../service/cart.service';
// import { MatDialog } from '@angular/material/dialog';
// import { environment } from '../../../environments/environment';
// import { ShoppingCartComponent } from '../../shopping/modal/shopping-cart/shopping-cart.component';
// import { ResetPasswordComponent } from '../reset-password/reset-password.component';
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

    private fb: FormBuilder,
    // private authService: AuthService,
    // private tokenService: TokenService,
    // private cookieService: CookieService,
    // private cdr: ChangeDetectorRef,
    // private toastrService: ToastrService,
    // private cartService: CartService,
    // private dialog: MatDialog,

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
 
}