import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './tokenservice';

@Injectable({
    providedIn: 'root',
})

export class requestService {
    constructor(private http: HttpClient, private tokenService: TokenService,) { }

    submitRequest<T>(method: string, url: string, formData?: any, payload?: any): Observable<any> {
        return new Observable((observer) => {
            const authData = this.tokenService.getAuthData();
            if (!authData || !authData.accessToken) {
                alert('veuillez vous reconnecter');
                observer.error('Access token not found');
                return;
            }
    
            let requestObservable: Observable<T>;
            switch (method) {
                case 'POST':
                    requestObservable = this.http.post<T>(url, formData);
                    break;
                case 'GET':
                    requestObservable = this.http.get<T>(url);
                    break;
                case 'DELETE':
                    requestObservable = this.http.delete<T>(url, { body: payload });
                    break;
                default:
                    observer.error('Unsupported HTTP method');
                    return;
            }
    
            requestObservable.subscribe(
                (response) => {
                    observer.next(response);
                    observer.complete();
                },
                (error) => {
                    observer.error(error);
                }
            );
        });
    }
}
