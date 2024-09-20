import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { TokenService } from './tokenservice';
import { Router } from '@angular/router';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService,
    private router: Router,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler, payload?: any): Observable<HttpEvent<any>> {
    const authData = this.tokenService.getAuthData();
    const accessToken = authData?.accessToken;
    const refreshToken = authData?.refreshToken;

    if (accessToken) {
      request = this.addAuthorizationHeader(request, accessToken);
    }

    if (refreshToken) {
      request = this.addAuthorizationHeader(request, refreshToken);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          if (refreshToken && !request.url.endsWith('/auth/refresh-token')) {
            //     console.log('Refreshing token...');
            return this.tokenService.refreshAccessToken(refreshToken).pipe(
              switchMap((refreshResponse) => {
                // Créez une nouvelle demande avec le jeton rafraîchi
                const newRequest = this.addAuthorizationHeader(request.clone(), refreshResponse.accessToken);
                //     console.log('Token refreshed successfully.', newRequest);
                return next.handle(newRequest);
              }),

              catchError((refreshError) => {
                alert('Votre session a expiré, veuillez vous reconnecter.');
                //      this.router.navigate(['/login']);
                return throwError(refreshError);
              })
            );
          } else {

          }
        }
        return throwError(error);
      })
    );
  }

  private addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   const authData = this.tokenService.getAuthData();
  //   const accessToken = authData?.accessToken;
  
  //   // Attach access token if it exists
  //   if (accessToken) {
  //     request = this.addAuthorizationHeader(request, accessToken);
  //   }
  
  //   return next.handle(request).pipe(
  //     catchError((error) => {
  //       if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.endsWith('/auth/refresh-token')) {
  //         const refreshToken = authData?.refreshToken;
  
  //         // Proceed with refresh token only if it's available
  //         if (refreshToken) {
  //           return this.tokenService.refreshAccessToken(refreshToken).pipe(
  //             switchMap((refreshResponse) => {
  //               // Update and persist new access token
  //               this.tokenService.setAccessToken(refreshResponse.accessToken);
  
  //               // Clone the original request with the new token and retry
  //               const newRequest = this.addAuthorizationHeader(request.clone(), refreshResponse.accessToken);
  //               return next.handle(newRequest);
  //             }),
  //             catchError((refreshError) => {
  //               console.log('Refresh token failed:', refreshError);
  //               alert('Votre session a expiré, veuillez vous reconnecter.');
  //               this.tokenService.removeAuthData();  // Clear tokens
  //               //this.router.navigate(['/login']);  // Redirect to login
  //               return throwError(refreshError);
  //             })
  //           );
  //         }
  //       }
  
  //       // Other errors, pass through
  //       return throwError(error);
  //     })
  //   );
  // }
  
  // private addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
  //   return request.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   });
  // }
  
  
}