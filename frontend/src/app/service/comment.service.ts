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
  
  updateComment(id: number, folderId: number, content: string): Observable<Comment> {
    const url = `${this.apiUrl}/comments/${id}`;
    return this.http.put<Comment>(url,{content, folderId})
  }

  updateReply(id:number, folderId:number, content:string):Observable<Comment>{
    const url =`${this.apiUrl}/comments/replies/${id}`;
    return this.http.put<Comment>(url,{content, folderId})
  }
  
  getUserComments(id:number): Observable<any> {
    const url = `${this.apiUrl}/comments/user-comment/${id}`;
    return this.http.get<any[]>(url);
  }
  
  getUserSuggestions(prefix: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comments/suggestions`, {
        params: { prefix }
    });
}

deleteComment(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/comments/delete/${id}`);
}

deleteReply(id: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/comments/delete-reply/${id}`);
}

////////////////////////
//admin role

deleteUserComment(commentId: number): Observable<any> {
  return this.http.delete<any>(`${this.apiUrl}/comments/${commentId}`);
}

}