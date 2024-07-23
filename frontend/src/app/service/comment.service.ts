import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Frontend service method to add a comment
  addComment(folderId: number, content: string): Observable<Comment> {
    const url = `${this.apiUrl}/comments/${folderId}`;
    return this.http.post<Comment>(url, { content });
  }

  //fetch comments
  getComments(folderId: number): Observable<any[]> {
    const url = `${this.apiUrl}/comments/folder/${folderId}`;
    return this.http.get<any[]>(url);
  }

  //add reply
  addReply(commentId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments/${commentId}/reply`, { content });
  }
  

}    