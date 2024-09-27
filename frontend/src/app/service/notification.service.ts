import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { TokenService } from './tokenservice';
import { TokenInterceptor } from './token-interceptor.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient,
    private tokenService: TokenService,
    private HttpInterceptor:TokenInterceptor

  ) {}

  getAllUserNotifications(id:number): Observable<Notification[]> {
    const url = `${this.apiUrl}/notifications/getUserNotification/${id}`;
    return this.http.get<Notification[]>(url);
  }
  
  getOrderNotification():Observable<Notification []> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/admin/OrderNotification`)
  }

  getUserNotificationById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/notifications/${id}`);
  }
  
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  } 
  
  deleteUserNotification(id:number):Observable<any> {
    const url = `${this.apiUrl}/notifications/${id}`
  return this.http.delete<any>(url);
  }

  deleteAllUserNotifications(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/notifications/`);
  }


}
