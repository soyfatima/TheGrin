import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ReportService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    reportUser(reportData: { userId: number; reason: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/report/report/user/${reportData.userId}`, reportData); // Pass the commentId in the URL
    }

    reportComment(reportData: { commentId: number; reason: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/report/report/comment/${reportData.commentId}`, reportData); // Pass the commentId in the URL
    }

    reportReply(reportData: { replyId: number; reason: string }): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/report/report/reply/${reportData.replyId}`, reportData); // Pass the commentId in the URL
    }

    reportFolder(reportData: { folderId: number; reason: string }): Observable<any> {
        const url = `${this.apiUrl}/report/report/folder/${reportData.folderId}`;
        return this.http.post<any>(url, reportData);
    }
    





}