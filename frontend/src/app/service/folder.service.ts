import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})

export class FolderService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createFolder(folderData: FormData): Observable<any> {
    const url = `${this.apiUrl}/folders/create`;
    return this.http.post<any>(url, folderData);
  }

  getFolderDetails(): Observable<any> {
    const url = `${this.apiUrl}/folders/folderdetails`;
    return this.http.get<any[]>(url);
  }

  updateFolderContent(id: number, title:string, content: string): Observable<any> {
    const url = `${this.apiUrl}/folders/${id}`;
    return this.http.put<any>(url, { title, content });
  }

  getUserFolders(id: number): Observable<any> {
    const url = `${this.apiUrl}/folders/user-folders/${id}`;
    return this.http.get<any[]>(url);
  }

  deleteFolder(id: number): Observable<any> {
    const url = `${this.apiUrl}/folders/delete/${id}`;
    return this.http.delete<any>(url);
  }

  //////////////////////////////////////

  createAdminNote(folderData: FormData): Observable<any> {
    const url = `${this.apiUrl}/folders/create/note`;
    return this.http.post<any>(url, folderData);
  }

  markNoteAsRead(noteId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/folders/mark-note-as-read`, { noteId, userId });
  }
  
  updateAdminNote(id: string, updatedFolderData: any): Observable<any> {
    const url = `${this.apiUrl}/folders/update/note/${id}`;
    return this.http.patch<any>(url, updatedFolderData);
  }

  deleteAdminNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/folders/delete/note/${id}`);
  }

  fetchAdminNote(): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/folders/admin-notes`)
  }
  deleteUserFolder(folderId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/folders/${folderId}`);
  }
  

  // getAdminNoteDetailById(id: number): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}/folderdetails/${id}`);
  // }

}
