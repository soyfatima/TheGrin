import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})

export class ProductService {
    private apiUrl: string = environment.apiUrl;

    constructor(private http: HttpClient) { }

    createProduct(productData: FormData): Observable<any> {
        const url = `${this.apiUrl}/products/create`;
        return this.http.post<any>(url, productData);
    }

    updateProduct(id: string, updatedProductData: any): Observable<any> {
        const url = `${this.apiUrl}/products/${id}`;
        return this.http.put<any>(url, updatedProductData)
    }

    deleteProduct(id: number): Observable<any> {
        const url = `${this.apiUrl}/products/${id}`;
        return this.http.delete<any>(url);
    }
    
    fetchProduct(): Observable<any> {
        const url = `${this.apiUrl}/products/fetchproduct`;
        return this.http.get<any[]>(url);
    }

    getProductDetailsById(id: number): Observable<any> {
        const url = `${environment.apiUrl}/products/getproductdetails/${id}`; // Correction de l'URL
        return this.http.get<any>(url);
    }

    //format number with separator
  formatNumberWithSeparator(number: { toString: () => string; }) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}