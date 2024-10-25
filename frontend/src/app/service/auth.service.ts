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
  // login(email: string, password: string): Observable<any> {
  //   const url = `${this.apiUrl}/auth/login`;
  //   return this.http.post<any>(url, { email, password }).pipe(
  //     tap(response => {
  //       if (response && response.accessToken) {
  //         localStorage.setItem('currentUser', JSON.stringify(response.userInfo));
  //         this.updateLoginStatus();
  //       }
  //     })
  //   );
  // }

  // isAdmin(): boolean {
  //   const currentUser = localStorage.getItem('currentUser');
  //   if (currentUser) {
  //     const user = JSON.parse(currentUser);
  //     //console.log('Current user role:', user.role);
  //     return user.role === 'admin';
  //   }
  //   return false;
  // }

  // isUser(): boolean {
  //   const currentUser = localStorage.getItem('currentUser');
  //   if (currentUser) {
  //     const user = JSON.parse(currentUser);
  //     return user.role === 'user';
  //   }
  //   return false;
  // }


   // Admin login
   login(email: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/auth/login`;
    return this.http.post<any>(url, { email, password }).pipe(
      tap(response => {
        if (response.accessToken && response.refreshToken) {
          this.tokenService.setAccessTokenInCookie(
            response.accessToken,
            response.refreshToken,
            JSON.stringify(response.userInfo)  
          );
          this.updateLoginStatus();
        }
      }),
      catchError((error: HttpErrorResponse) => {
      //  console.error('Admin login failed:', error);
        return throwError('Login failed: ' + error.message);
      })
    );
  }


  isAdmin(): boolean {
    const authData = this.tokenService.getAuthData();
    if (authData && authData.userInfo) {
      const user = typeof authData.userInfo === 'string'
        ? JSON.parse(authData.userInfo)
        : authData.userInfo;

      return user.role === 'admin';
    }

    return false;
  }

  isUser(): boolean {
    const authData = this.tokenService.getAuthData();
    if (authData && authData.userInfo) {
      const user = typeof authData.userInfo === 'string'
        ? JSON.parse(authData.userInfo)
        : authData.userInfo;

      return user.role === 'user';
    }
    return false;
  }

  private updateLoginStatus(): void {
    // Retrieve authentication data from the token service
    const authData = this.tokenService.getAuthData();
    let loggedInUser = null;
  
    // Parse and set the logged-in user information if available
    if (authData && authData.userInfo) {
      if (typeof authData.userInfo === 'string') {
        loggedInUser = JSON.parse(authData.userInfo);
      } else {
        loggedInUser = authData.userInfo;
      }
    }
  
    // Update the loggedInUserSubject with the current user
    this.loggedInUserSubject.next(loggedInUser);
  
    // If a user is logged in, check for the access token and retrieve notifications
    if (loggedInUser) {
      const accessToken = authData?.accessToken;
  
      if (accessToken) {
        this.notifService.getAllUserNotifications(loggedInUser.id).subscribe(
          (notifications) => {
            // Handle notifications as needed
            // Example: this.notificationsSubject.next(notifications);
          },
          (error) => {
            console.error('Failed to fetch notifications:', error);
          }
        );
      } else {
        console.warn('Access token is not available.');
      }
    }
  }
  

  isLoggedIn(): boolean {
    return this.tokenService.getAuthData() !== null;
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

  // updateLoginStatus(): void {
  //   const currentUser = localStorage.getItem('currentUser');
  //   const loggedInUser = currentUser ? JSON.parse(currentUser) : null;
  //   this.loggedInUserSubject.next(loggedInUser);

  //   if (loggedInUser) {
  //     // Ensure the token is available before making the request
  //     const authData = this.tokenService.getAuthData();
  //     const accessToken = authData?.accessToken;

  //     if (accessToken) {
  //       this.notifService.getAllUserNotifications(loggedInUser.id).subscribe(
  //         (notifications) => {
  //         },
  //         (error) => {
  //           // console.error('Failed to fetch notifications:', error);
  //         }
  //       );
  //     } else {
  //       // console.warn('Access token is not available.');
  //     }
  //   }
  // }

  // isLoggedIn(): boolean {
  //   return !!localStorage.getItem('currentUser');
  // }

  userLogin(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/auth/userLogin`;
    return this.http.post<any>(url, { username, password }).pipe(
      tap(response => {
        if (response.accessToken && response.refreshToken) {
          this.tokenService.setAccessTokenInCookie(response.accessToken, response.refreshToken, JSON.stringify(response.userInfo));
          this.updateLoginStatus();
        }
      }),
      catchError((error: HttpErrorResponse) => {
      //  console.error('User login failed:', error);
        return throwError('Login failed: ' + error.message);
      })
    );
  }
  logout(): Observable<void> {
    const authData = this.tokenService.getAuthData(); 
    if (!authData || !authData.accessToken) {
     // console.warn('No access token found. User may already be logged out.');
      return of();
    }

    const url = `${this.apiUrl}/auth/logout`;
    return this.http.post<void>(url, { accessToken: authData.accessToken }).pipe(
      tap(() => {
        this.tokenService.removeAuthData();
        this.updateLoginStatus();
      }),
      catchError((error: HttpErrorResponse) => {
      //  console.error('Logout failed:', error);
        return throwError('Logout failed: ' + error.message);
      })
    );
  }

  // set the logged-in user's information upon successful login
  setLoggedInUser(user: { username: string }) {
    this.loggedInUser = user;
  }
  // to retrieve the logged-in user's information, including the username
  getLoggedInUser(): { username: string } | null {
    return this.loggedInUser;
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
