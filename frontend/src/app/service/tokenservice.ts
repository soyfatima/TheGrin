

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieOptions, CookieService } from 'ngx-cookie-service';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})

export class TokenService {
  constructor(private cookieService: CookieService,
    private http: HttpClient,) { }

    refreshAccessToken(refreshToken: string): Observable<{ accessToken: string }> {
      const refreshTokenPayload = { refreshToken };
  
      return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/refresh-token`, refreshTokenPayload)
        .pipe(
          tap(response => {
            this.setAccessToken(response.accessToken);
          }),
          catchError(error => {
         //   console.error('Refresh Token API Error:', error);
            throw error;
          })
        );
    }

  setAccessTokenInCookie(accessToken: string, refreshToken: string, userInfo: string): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + 1);
  //  expires.setDate(expires.getDate() + 365 * 10);
    const cookieOptions: CookieOptions = {
      expires,
      secure: true,
      sameSite: 'Strict',
    };
    this.cookieService.set('authData', JSON.stringify({ accessToken, refreshToken, userInfo }), cookieOptions);
  }

  getAuthData(): { accessToken: string; refreshToken: string; userInfo: string } | null {
    const authDataString = this.cookieService.get('authData');
    if (authDataString) {
      return JSON.parse(authDataString) as { accessToken: string; refreshToken: string; userInfo: string };
    }
    return null;
  }
  // getAuthData(): { accessToken: string; refreshToken: string; userInfo: string } | null {
  //   const authDataString = this.cookieService.get('authData'); // Retrieve the cookie
  //   if (authDataString) {
  //     return JSON.parse(authDataString); // Parse the JSON string into an object
  //   }
  //   return null;
  // }
  removeAuthData(): void {
    this.cookieService.delete('authData');
  }

  setAccessToken(accessToken: string): void {
    const authData = this.getAuthData();
    if (authData) {
      this.setAccessTokenInCookie(accessToken, authData.refreshToken, authData.userInfo);
    }
  }
}
