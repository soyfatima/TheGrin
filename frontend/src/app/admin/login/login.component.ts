import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AnimationService } from '../../service/animate-service';
import { TokenService } from '../../service/tokenservice';
import { AuthService } from '../../service/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [AnimationService.prototype.getSlideInAnimation()],
})

export class LoginComponent implements OnInit {
  animationState = 'in';
  loginForm!: FormGroup;
  preloaderVisible = true;

  constructor(
    private animationService: AnimationService,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    private tokenService: TokenService,
    private authService: AuthService,
    private toastrService: ToastrService,

  ) { }

  ngOnInit() {
    this.animationState = 'in';
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
this.preloader()

  }

  preloader() {
    setTimeout(() => {
      this.preloaderVisible = false;
    }, 2000); // Modify this delay as needed
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
  
    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
  
    this.authService.login(email, password).subscribe(
      (response) => {
        if (response.accessToken) {
          this.tokenService.setAccessTokenInCookie(response.accessToken, response.refreshToken, response.userInfo);
          this.toastrService.success('Bienvenue sur votre tableau de bord');
          
          const isAdmin = response.role === 'admin';
          if (isAdmin) {
            this.router.navigate(['/home']);
          } else {
            this.toastrService.error('Une erreur s\'est produite lors de la connexion veuillez réessayer.');
            this.router.navigate(['/login']);
          }
        } else {
          this.toastrService.error('Une erreur s\'est produite lors de la connexion veuillez réessayer.');
        }
      },
      error => {
        this.toastrService.error('Connexion échouée, veuillez réessayer.');
      }
    );
  }
  
}