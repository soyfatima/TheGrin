import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // getUserCart(userId: number): Observable<any> {
  //   return this.http.get<any>(`${this.apiUrl}/cart/${userId}`);
  // }
  getUserCart(): Observable<any> {
    const url = `${this.apiUrl}/cart/userCart`;
    return this.http.get<any>(url)
  }
  addToCartWithQuantity(productId: number, quantity: number): Observable<any> {
    const url = `${this.apiUrl}/cart/addToCartWithQuantity`;
    return this.http.post<any>(url, { productId, quantity });
  }
  addToCart1(productId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/cart/addToCart`, { productId });
  }
  
  getTotalCartPrice(): Observable<{ totalPrice: number, totalQuantity: number }> {
    const url = `${this.apiUrl}/cart/getTotalCartPrice`;
    return this.http.post<{ totalPrice: number, totalQuantity: number }>(url, {});
  }

  updateCartItem(itemId: number, updateData: any): Observable<any> {
    const url = `${this.apiUrl}/cart/${itemId}`;
    return this.http.put<any>(url, updateData);
  }
  updateCartItemFromCart(itemId: number, updateData: any): Observable<any> {
    const url = `${this.apiUrl}/cart/cart/${itemId}`;
    return this.http.put<any>(url, updateData);
  }

  getSingleItemPrice(itemId: number): Observable<{ totalPrice: number; totalQuantity: number }> {
    const url = `${this.apiUrl}/cart/item/${itemId}`;
    return this.http.get<{ totalPrice: number; totalQuantity: number }>(url);
  }

  getItemPrice(productId: number): Observable<{ totalPrice: number; totalQuantity: number }> {
    const url = `${this.apiUrl}/cart/product/${productId}`;
    return this.http.get<{ totalPrice: number; totalQuantity: number }>(url);
  }
  removeFromCart(productId: number): Observable<any> {
    const url = `${this.apiUrl}/cart/remove/${productId}`;
    return this.http.delete<any>(url);
  }

}
