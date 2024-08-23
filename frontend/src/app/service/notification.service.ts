import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllNotifications(): Observable<Notification[]> {
    const url = `${this.apiUrl}/notifications/getNotification`
    return this.http.get<Notification[]>(url);
  }

  getNotificationById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.apiUrl}/notifications/${id}`);
  }
  
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  } 
  
  deleteNotification(id:number):Observable<any> {
    const url = `${this.apiUrl}/notifications/${id}`
  return this.http.delete<any>(url);
  }

  deleteAllNotifications(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/notifications/`);
  }
  
  deleteUserNotification(id:number):Observable<any> {
    const url = `${this.apiUrl}/notifications/${id}`
  return this.http.delete<any>(url);
  }

  deleteAllUserNotifications(): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/notifications/`);
  }

}
