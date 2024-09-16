

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderRequest } from '../components/add-customer-request/customerorder';
import { environment } from 'src/environments/environment';

const API = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private baseUrl = `${API}v1/ise/inventory`;
  
  
  // Base URL for the API

  constructor(private http: HttpClient) { }

  // Method to fetch customer data
  getCustomers(): Observable<any[]> {
    const url = `${this.baseUrl}/customer/list`;  // API endpoint for customer list
    return this.http.get<any[]>(url);  // Return an Observable of the HTTP GET request
  }

  // Method to fetch grid data based on customer ID, goods type, and lot number
  getGridData(customerId: number, goodsType: string, lotNumber: string): Observable<any[]> {
    const url = `${this.baseUrl}/customer/inventory?customerId=${customerId}&goodsType=${goodsType}&lotNumber=${lotNumber}`;
    return this.http.get<any[]>(url);  // Return an Observable of the HTTP GET request
  }
  getallconsumersGridData(): Observable<any[]> {
    const url = `${this.baseUrl}/customer/getallorder`;
    return this.http.get<any[]>(url);  // Return an Observable of the HTTP GET request
  }
  processCustomerOrder(payload: OrderRequest): Observable<any> {
    const body = {
      LoginId: 1,
      InputJSON: JSON.stringify(payload)
    };

    return this.http.post(`${this.baseUrl}/customer/addcustomerorder`, body);
  }
}
