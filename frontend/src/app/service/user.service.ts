import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class userService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  updateUserInfo(id: number, formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/users/${id}/update`;
    return this.http.put(url, formData);
  }

  deleteUserPicture(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}/deletePicture`)
  }

  getUserInfo(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/user/${id}`);
  }

  getAdminInfo(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/admin/${id}`);
  }

  blockUser(id: number, blocked: boolean): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/blockUser/${id}`, { blocked });
  }

  GetAllUser(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/GetAllUser`)
  }
}