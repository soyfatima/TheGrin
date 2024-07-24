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
  constructor(private tokenService: TokenService, private router: Router) {}

 
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authData = this.tokenService.getAuthData();
    const accessToken = authData?.accessToken;
    const refreshToken = authData?.refreshToken;

    if (accessToken) {
      request = this.addAuthorizationHeader(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401 && refreshToken) {
          return this.handleUnauthorizedError(request, next, refreshToken);
        }
        return throwError(error);
      })
    );
  }

  private handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler, refreshToken: string): Observable<HttpEvent<any>> {
    return this.tokenService.refreshAccessToken(refreshToken).pipe(
      switchMap((refreshResponse) => {
        this.tokenService.setAccessTokenInCookie(refreshResponse.accessToken, refreshToken, JSON.stringify(this.tokenService.getAuthData()?.userInfo || ''));
        const newRequest = this.addAuthorizationHeader(request.clone(), refreshResponse.accessToken);
        return next.handle(newRequest);
      }),
      catchError((refreshError) => {
        this.tokenService.removeAuthData();
        //this.router.navigate(['/login']);
        return throwError(refreshError);
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

