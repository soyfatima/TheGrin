import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { catchError, map, Observable, of } from 'rxjs';
import { TokenService } from '../../../service/tokenservice';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {

  
  IsUserLogged: boolean = false;
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
    private authService: AuthService,
    private tokenService: TokenService,
    private cookieService: CookieService,
    private cdr: ChangeDetectorRef,
    private toastrService: ToastrService,
    //private cartService: CartService,
    private dialog: MatDialog,

  ) {
 
  }

  ngOnInit(): void {
    // Subscribe to router events to update the current route

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.signupForm = this.fb.group({
      Newemail: ['', Validators.required],
      Newusername: ['', Validators.required],
      Newpassword: ['', Validators.required]
    });
    this.checkUserLoginStatus();


  }

  //user signup
  signup() {
    if (this.signupForm.invalid) {
      return;
    }
    const Newemail = this.signupForm.get('Newemail')?.value;
    const Newusername = this.signupForm.get('Newusername')?.value;
    const Newpassword = this.signupForm.get('Newpassword')?.value;

    this.authService.userSignup(Newemail, Newusername, Newpassword).subscribe(
      (response) => {
        if (response.accessToken) {
          this.data = response;
          this.toastrService.success('Compte crée avec succès');
          this.signupForm.reset();
       //   this.showLoginPopup = true;
        } else {
          this.toastrService.error('erreur lors de l\'inscription, veuillez réessayer');
          console.error('Signup failed: No access token received');
        }
      },
      (errorMessage) => {
        console.error('Signup failed:', errorMessage);
        if (errorMessage === 'Email already exists') {
          this.emailErrorMessage = errorMessage;
        } else if (errorMessage === 'Username already exists') {
          this.usernameErrorMessage = errorMessage;
        } else {
          this.usernameErrorMessage = errorMessage;
          this.emailErrorMessage = errorMessage;
        }
      }
    );
  }

  //user logged
  login() {
    if (this.loginForm.invalid) {
      return;
    }

    const username = this.loginForm.get('username')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.userLogin(username, password).subscribe(
      (response) => {
          this.toastrService.success('Vous êtes connecté avec succès');
        if (response.accessToken && response.refreshToken) {
          this.loggedInUser = response.userInfo;
          this.tokenService.setAccessTokenInCookie(response.accessToken, response.refreshToken, JSON.stringify(response.userInfo));
        this.IsUserLogged = true;
        this.dialog.closeAll();
          this.loggedInUser = response.userInfo;
          this.loggedInUser.role = response.role;
        } else {
          console.error('Login failed: Tokens missing in the response');
        }
      },
      (errorMessage) => {
        // Display Toastr message based on active navbar type
         this.toastrService.error('Erreur de connexion, veuillez réessayer');
        console.error('Login failed:', errorMessage);
        this.userErrorMessage = errorMessage;
      }
    );
  }

  isLoggedIn(): Observable<boolean> {
    const authData = this.tokenService.getAuthData();

    if (!authData || !authData.accessToken) {
      return of(false);
    }
    return this.authService.verifyToken(authData.accessToken).pipe(
      map(response => {
        return response.valid && response.userId !== null;
      }),
      catchError(error => {
        console.error('Error verifying token:', error);
        return of(false);
      })
    );
  }

  checkUserLoginStatus(): void {
    const authData = this.tokenService.getAuthData();
    if (authData && authData.accessToken) {
      this.authService.verifyToken(authData.accessToken).subscribe(
        (response) => {
          const loggedIn = response.valid && response.userId !== null;
          this.IsUserLogged = loggedIn;
          // if (this.activeNavbarType === 'store') {
          this.toastrService.success(loggedIn ? 'Utilisateur connecté' : 'Utilisateur déconnecté');
          // }
        },
        (error) => {
          console.error('Error verifying token:', error);
          this.IsUserLogged = false;
        }
      );
    } else {
      this.IsUserLogged = false;
    }
  }


  logout(): void {
    this.tokenService.removeAuthData();
    this.IsUserLogged = false;
  }

  switchTab(tab: string): void {
    this.tab = tab;
  }

  // fetchUserCart(): void {
  //   this.cartService.getUserCart().subscribe(
  //     (userCart) => {
  //       // Ensure items array is always initialized
  //       userCart.items = userCart.items || [];

  //       // Optionally format cart items or data as needed
  //       userCart.items = userCart.items.map((item: any) => ({
  //         ...item,
  //         product: {
  //           ...item.product,
  //           uploadedFileUrl: `${environment.apiUrl}/blog-backend/uploads/${item.product.uploadedFile}`
  //         }
  //       }));

  //       const dialogRef = this.dialog.open(ShoppingCartComponent, {
  //         width: 'auto',
  //         data: { userCart },
  //       });

  //       // Subscribe to dialog close event
  //       dialogRef.afterClosed().subscribe(result => {
  //       });
  //     },
  //     (error) => {
  //       this.toastrService.error('Erreur lors de l\'affichage du panier');
  //       console.error('Error fetching user cart:', error);
  //     }
  //   );
  // }


//   openDialog(): void {
//     this.dialog.open(ResetPasswordComponent, {
//       width: '400px',
//       data: { }
//     });
//   this.showLoginPopup=false;
// }

}
