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

    // this.authService.loggedInUser$.subscribe(user => {
    //   this.IsUserLogged = !!user;
    // });

    const authData = this.tokenService.getAuthData();
    this.IsUserLogged = !!authData?.accessToken;

    // Subscribe to the observable to keep track of authentication changes
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
          this.dialog.closeAll();
          this.loggedInUser = response.userInfo;
          this.loggedInUser.role = response.role;
        } else {
        //  console.error('Login failed: Tokens missing in the response');
        }
      },
        (error) => {
        //  console.error('Login error:', error);
    
          const errorMessage = error || 'Erreur de connexion, veuillez réessayer';
    
          if (errorMessage === 'User is blocked') {
            this.toastrService.error('Votre compte est bloqué. Veuillez contacter l\'administrateur.');
          } else {
            this.toastrService.error(errorMessage);
          }
    
          this.userErrorMessage = errorMessage;
        }
      );
    }

  switchTab(tab: string): void {
    this.tab = tab;
  }

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
