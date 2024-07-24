import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieOptions, CookieService } from 'ngx-cookie-service'; // Import CookieService
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class TokenService {
  
  constructor(private cookieService: CookieService,
    private http: HttpClient,) { }

  refreshAccessToken(refreshToken: string): Observable<{ accessToken: string }> {
    const refreshTokenPayload = { refreshToken };
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`,
    });
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/refresh-token`, refreshTokenPayload, { headers })
      .pipe(
        tap(response => {
          //console.log('Access token refreshed successfully:', response);
        }),
        catchError(error => {
          //  console.error('Refresh Token API Error:', error);
          throw error;
        })
      );
  }

  setAccessTokenInCookie(accessToken: string, refreshToken: string, userInfo: string): void {
    console.log('Storing Tokens:', { accessToken, refreshToken, userInfo }); // Log tokens and userInfo being stored
    const expires = new Date();
  expires.setDate(expires.getDate() + 1);
    const cookieOptions: CookieOptions = {
      expires,
      secure: false, 
      sameSite: 'Strict',
    };
    this.cookieService.set('authData', JSON.stringify({ accessToken, refreshToken, userInfo }), cookieOptions);
  }

  getAuthData(): { accessToken: string; refreshToken: string; userInfo: string } | null {
    const authDataString = this.cookieService.get('authData');
    //console.log('Retrieved Auth Data String:', authDataString); // Log retrieved auth data string

    if (authDataString) {
   //   return JSON.parse(authDataString) as { accessToken: string; refreshToken: string; userInfo: string };
   const authData = JSON.parse(authDataString) as { accessToken: string; refreshToken: string; userInfo: string };
   // console.log('Parsed Auth Data:', authData); // Log parsed auth data
    return authData;  
  }
    return null;
  }

  removeAuthData(): void {
    this.cookieService.delete('authData');
  }
}
