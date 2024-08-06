import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private apiUrl: string = environment.apiUrl;
  private loggedInUser: { username: string } | null = null;

  constructor(private http: HttpClient) { }

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

  updateLoginStatus(): void {
    const currentUser = localStorage.getItem('currentUser');
    this.loggedInUser = currentUser ? JSON.parse(currentUser) : null;
  }


  isLoggedIn(): boolean {
    const currentUser = localStorage.getItem('currentUser');
    const isLoggedIn = !!currentUser;
    return isLoggedIn;
  }

  //user signup for blog
  userSignup(email: string, username: string, password: string, gender:string): Observable<any> {
    const url = `${this.apiUrl}/auth/userSignup`;
    return this.http.post<any>(url, { email, username, password , gender}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error.message.includes('Email already exists')) {
          return throwError('Email already exists');
        } else if (error.error.message.includes('Username already exists')) {
          return throwError('Username already exists');
        } else if (error.error.message.includes('selectionné un genre')){
          return throwError('genre non selectionné');

      }else {
          return throwError(error.error.message);
        }
      })
    );
  }

  //user login for blog 
  userLogin(username: string, password: string): Observable<any> {
    const url = `${this.apiUrl}/auth/userLogin`;
    return this.http.post<any>(url, { username, password }).pipe(
      //      catchError((error: HttpErrorResponse) => {
      tap(response => {

        if (response && response.accessToken) {
          localStorage.setItem('currentUser', JSON.stringify(response.userInfo));
          this.updateLoginStatus();
        }
        //  return throwError('Login failed: ' + error.error.message);
      })

    );
  }

  //user log token for blog
  verifyToken(accessToken: string): Observable<{ valid: boolean; userId: number | null }> {
    return this.http.post<{ valid: boolean, userId: number | null }>(`${this.apiUrl}/auth/verify-token`, { accessToken }).pipe(
      tap(response => {
     //   console.log('Token verification response:', response);
      }),
      catchError(error => {
        console.error('Error verifying token:', error);
        return of({ valid: false, userId: null });
      })
    );
  }



  // Method to set the logged-in user's information upon successful login
  setLoggedInUser(user: { username: string }) {
    this.loggedInUser = user;
  }
  // Method to retrieve the logged-in user's information, including the username
  getLoggedInUser(): { username: string } | null {
    return this.loggedInUser;
  }


  logout(accessToken: string): Observable<void> {
    const url = `${this.apiUrl}/auth/logout`;
    return this.http.post<void>(url, { accessToken }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Logout failed:', error);
        return throwError('Logout failed: ' + error.message);
      })
    );
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


//  updateUserInfo(id: number, username?: string, file?: File | null): Observable<any> {
//   const url = `${this.apiUrl}/auth/${id}/update`;
//   const formData = new FormData();

//   if (username) {
//     formData.append('username', username);
//   }
  
//   if (file) {
//     formData.append('uploadedFile', file, file.name);
//   }

//   console.log('Sending FormData:', formData);

//   return this.http.put<any>(url, formData).pipe(
//     tap(response => console.log('Update User Info Response:', response)),
//     catchError(error => {
//       console.error('Error updating user info:', error);
//       return throwError(error);
//     })
//   );
// }

updateUserInfo(id: number, formData: FormData): Observable<any> {
  const url = `${this.apiUrl}/auth/${id}/update`;
  return this.http.put(url, formData);
}

}
