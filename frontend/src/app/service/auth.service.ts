import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { TokenService } from './tokenservice';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private apiUrl: string = environment.apiUrl;
  private loggedInUser: { username: string } | null = null;
  private loggedInUserSubject = new BehaviorSubject<any>(null);
  public loggedInUser$ = this.loggedInUserSubject.asObservable();

  private notificationsSubject = new BehaviorSubject<any[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient,
    private tokenService: TokenService,
    private notifService: NotificationService

  ) {
    this.updateLoginStatus();
  }

  //admin login 
  login(email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post<any>(url, { email, password }).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('currentUser', JSON.stringify(response.userInfo));
          this.updateLoginStatus();
        }
      })
    );
  }

  isAdmin(): boolean {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      //console.log('Current user role:', user.role);
      return user.role === 'admin';
    }
    return false;
  }

  isUser(): boolean {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      return user.role === 'user';
    }
    return false;
  }

  //user signup for blog
  userSignup(email: string, username: string, password: string, gender: string): Observable<any> {
    const url = `${this.apiUrl}/auth/userSignup`;
    return this.http.post<any>(url, { email, username, password, gender }).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error.message.includes('Email already exists')) {
          return throwError('Email already exists');
        } else if (error.error.message.includes('Username already exists')) {
          return throwError('Username already exists');
        } else if (error.error.message.includes('selectionné un genre')) {
          return throwError('genre non selectionné');

        } else {
          return throwError(error.error.message);
        }
      })
    );
  }

  updateLoginStatus(): void {
    const currentUser = localStorage.getItem('currentUser');
    const loggedInUser = currentUser ? JSON.parse(currentUser) : null;
    this.loggedInUserSubject.next(loggedInUser);

    if (loggedInUser) {
      // Ensure the token is available before making the request
      const authData = this.tokenService.getAuthData();
      const accessToken = authData?.accessToken;

      if (accessToken) {
        this.notifService.getAllUserNotifications(loggedInUser.id).subscribe(
          (notifications) => {
          },
          (error) => {
            // console.error('Failed to fetch notifications:', error);
          }
        );
      } else {
        // console.warn('Access token is not available.');
      }
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  userLogin(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/auth/userLogin`;
    return this.http.post<any>(url, { username, password }).pipe(
      tap(response => {
        if (response && response.accessToken) {
          const userWithToken = {
            ...response.userInfo,
            accessToken: response.accessToken
          };
          localStorage.setItem('currentUser', JSON.stringify(userWithToken));
          this.updateLoginStatus();
        } else {
          //              console.error('No accessToken found in the response.');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'Login failed: ' + error.message;
        //   console.error('Login error:', errorMessage); // Log the error message
        return throwError(errorMessage);
      })
    );
  }

  logout(accessToken: string): Observable<void> {
    this.clearAuthData();
    const url = `${this.apiUrl}/auth/logout`;
    return this.http.post<void>(url, { accessToken }).pipe(
      tap(() => {
        localStorage.removeItem('currentUser');
        this.updateLoginStatus();
      }),
      // catchError((error: HttpErrorResponse) => {
      //    // console.error('Logout request failed:', error); 
      //     return throwError('Logout failed: ' + error.message);
      //   })
    );
  }

  clearAuthData() {
    localStorage.removeItem('currentUser');
    this.loggedInUserSubject.next(null);
  }


  requestResetCode(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/reset-code`, { email });
  }

  verifyResetCode(email: string, code: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/verify-code`, { email, code });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/reset-password`, { email, code, newPassword });
  }

}
