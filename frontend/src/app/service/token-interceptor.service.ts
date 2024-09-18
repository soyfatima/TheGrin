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

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authData = this.tokenService.getAuthData();
    const accessToken = authData?.accessToken;
    
    if (accessToken) {
      request = this.addAuthorizationHeader(request, accessToken);
    }
    
    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          const refreshToken = authData?.refreshToken;
          if (refreshToken) {
            // Avoid refresh loop if the request URL is for refreshing the token
            if (!request.url.endsWith('/auth/refresh-token')) {
              return this.tokenService.refreshAccessToken(refreshToken).pipe(
                switchMap((refreshResponse) => {
                  this.tokenService.setAccessToken(refreshResponse.accessToken);
                  const newRequest = this.addAuthorizationHeader(request.clone(), refreshResponse.accessToken);
                  return next.handle(newRequest);
                }),
                catchError((refreshError) => {
                  alert('Votre session a expiré, veuillez vous reconnecter.');
               //   this.router.navigate(['/login']);
                  return throwError(refreshError);
                })
              );
            }
          } else {
            return throwError('No refresh token available');
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
  
}