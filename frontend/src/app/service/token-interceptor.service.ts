import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { TokenService } from './tokenservice';
import { Router } from '@angular/router';

@Injectable()

export class TokenInterceptor implements HttpInterceptor {
  private refreshingToken: boolean = false; // Flag to check if a refresh is in progress
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private tokenService: TokenService, private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authData = this.tokenService.getAuthData();
    const accessToken = authData?.accessToken;
    const refreshToken = authData?.refreshToken;

    if (accessToken) {
      request = this.addAuthorizationHeader(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && refreshToken) {
          return this.handleUnauthorizedError(request, next, refreshToken);
        }
        return throwError(error);
      })
    );
  }

  private handleUnauthorizedError(request: HttpRequest<any>, next: HttpHandler, refreshToken: string): Observable<HttpEvent<any>> {
    if (this.refreshingToken) {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => next.handle(this.addAuthorizationHeader(request, this.tokenService.getAuthData()?.accessToken || '')))
      );
    } else {
      this.refreshingToken = true;
      this.refreshTokenSubject.next(null);

      return this.tokenService.refreshAccessToken(refreshToken).pipe(
        switchMap((refreshResponse) => {
          this.refreshingToken = false;
          this.refreshTokenSubject.next(refreshResponse.accessToken);
          this.tokenService.setAccessTokenInCookie(refreshResponse.accessToken, refreshToken, JSON.stringify(this.tokenService.getAuthData()?.userInfo || ''));
          return next.handle(this.addAuthorizationHeader(request, refreshResponse.accessToken));
        }),
        catchError((refreshError) => {
          this.refreshingToken = false;
          this.tokenService.removeAuthData();
          this.router.navigate(['/login']);
          return throwError(refreshError);
        })
      );
    }
  }

  private addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
