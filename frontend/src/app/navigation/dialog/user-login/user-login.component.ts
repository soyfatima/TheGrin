import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { catchError, map, Observable, of } from 'rxjs';
import { TokenService } from '../../../service/tokenservice';
import { AuthService } from '../../../service/auth.service';
import { ResetPasswordComponent } from '../../reset-password/reset-password.component';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {

  data: any;
  dialogRef:any;

  IsUserLogged: boolean = false;
  tab = 'login';
  activeTab: string = 'login';
  loggedInUser: any;
  signupForm!: FormGroup;
  loginForm!: FormGroup;
  usernameErrorMessage: string | null = null;
  userErrorMessage: string | null = null;
  emailErrorMessage: string | null = null;
  genderErrorMessage: string | null = null;
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
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.signupForm = this.fb.group({
      Newemail: ['', Validators.required],
      Newusername: ['', Validators.required],
      Newpassword: ['', Validators.required],
      gender: ['', Validators.required],
    });

    this.authService.loggedInUser$.subscribe(user => {
      this.IsUserLogged = !!user;
    });
  }

  //user signup
  signup() {
    if (this.signupForm.invalid) {
      return;
    }
    const Newemail = this.signupForm.get('Newemail')?.value;
    const Newusername = this.signupForm.get('Newusername')?.value;
    const Newpassword = this.signupForm.get('Newpassword')?.value;
    const gender = this.signupForm.get('gender')?.value

    this.authService.userSignup(Newemail, Newusername, Newpassword, gender).subscribe(
      (response) => {
        if (response.accessToken) {
          this.data = response;
          this.toastrService.success('Compte crée avec succès');
          this.signupForm.reset();
        } else {
          this.toastrService.error('erreur lors de l\'inscription, veuillez réessayer');
          //   console.error('Signup failed: No access token received');
        }
      },
      (errorMessage) => {
        // console.error('Signup failed:', errorMessage);
        if (errorMessage === 'Email already exists') {
          this.emailErrorMessage = errorMessage;
        } else if (errorMessage === 'Username already exists') {
          this.usernameErrorMessage = errorMessage;
        } else if (errorMessage === 'Please select a gender') {
          this.genderErrorMessage = errorMessage;
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
          this.tokenService.setAccessTokenInCookie(response.accessToken, response.refreshToken, JSON.stringify(response.userInfo));
          console.log('refreshtoken', response.refreshToken);
          console.log('accesstoken', response.accessToken);
          console.log('user-info',response.userInfo);

          this.dialog.closeAll();
          this.loggedInUser = response.userInfo;
          this.loggedInUser.role = response.role;
          console.log(this.loggedInUser, 'response userinfo');
          console.log(this.loggedInUser.role, ' response.role')
        } else {
          // console.error('Login failed: Tokens missing in the response');
        }
      },
      (errorMessage) => {
        this.toastrService.error('Erreur de connexion, veuillez réessayer');
        // console.error('Login failed:', errorMessage);
        this.userErrorMessage = errorMessage;
      }
    );
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


  openDialog(): void {
    const dialogRef = this.dialog.open(ResetPasswordComponent, {
      width: 'auto',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }

}
