import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

getUserFolders(): Observable<any> {
  const url = `${this.apiUrl}/folders/user-folders`;
  return this.http.get<any[]>(url);
}

updateFolder(id: string, updatedFolderData: any): Observable<any> {
  const url = `${this.apiUrl}/folders/${id}`;
  return this.http.put<any>(url, updatedFolderData);
}

deleteFolder(id: number): Observable<any> {
  const url = `${this.apiUrl}/folders/${id}`;
  return this.http.delete<any>(url);
}

getFolderDetailsById(id: number): Observable<any> {
  const url = `${environment.apiUrl}/folders/getfolderdetails/${id}`; // Correction de l'URL
  return this.http.get<any>(url);
}
}