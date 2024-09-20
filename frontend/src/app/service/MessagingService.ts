import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
    private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendMessage(id:number , recipientId: number, content: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/messaging/send/${id}`, { recipientId, content });
  }
  
  getMessages(recipientId: number): Observable<any[]> {
    return this.http.get<{ messages: any[] }>(`${this.apiUrl}/messaging/conversation/${recipientId}`)
      .pipe(map(response => response.messages));
  }
 
  getSenders(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/messaging/senders?id=${id}`);
  }
}
