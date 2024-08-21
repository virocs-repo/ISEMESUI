import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn = false;
  static injector: Injector;

  constructor(injector: Injector, private router: Router) {
    AuthService.injector = injector;
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }
  loginSuccess() {
    this.isLoggedIn = true;
    localStorage.setItem('isLoggedIn', 'true');
    this.router.navigate(['/']);
  }
  logout() {
    this.isLoggedIn = false;
    localStorage.setItem('isLoggedIn', 'false');
    this.router.navigate(['/login']);
    localStorage.removeItem('UserPreferences');
  }
}
