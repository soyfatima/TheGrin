
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }


  globalOrder(orderData: any): Observable<any> {
    const url = `${this.apiUrl}/orders/global`;
    return this.http.post<any>(url, orderData);

  }

  orderSingle(orderData: any, itemId: number): Observable<any> {
    const url = `${this.apiUrl}/orders/single?itemId=${itemId}`;
    return this.http.post<any>(url, orderData);
  }

  fetchOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders/fetchOrders`);
  }
  deleteOrder(id: number): Observable<any> {
    const url = `${this.apiUrl}/orders/${id}`;
    return this.http.delete<any>(url);
}
}