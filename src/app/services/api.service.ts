import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const API = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  login(body: any) {
    return this.httpClient.post(`${API}v1/ise/inventory/login`, body);
  }
}
