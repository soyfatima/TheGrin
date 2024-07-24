import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private apiUrl = environment.apiUrl;

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
  
  updateComment(id: number, content: string, folderId: number): Observable<Comment> {
    //const payload = { content, folderId };
    const url = `${this.apiUrl}/comments/${id}`;
    return this.http.put<Comment>(url,{content, folderId})
    //console.log(`Sending PUT request to ${this.apiUrl}/comments/${id} with payload:`, payload);
   // return this.http.put<Comment>(`${this.apiUrl}/comments/${id}`, payload);
  }

  updateReply(id:number, folderId:number, content:string):Observable<Comment>{
    const url =`${this.apiUrl}/comments/replies/${id}`;
    return this.http.put<Comment>(url,{content, folderId})
  }
  
  getUserComments(id:number): Observable<any> {
    const url = `${this.apiUrl}/comments/user-comment/${id}`;
    return this.http.get<any[]>(url);
  }
  
  
  
}    