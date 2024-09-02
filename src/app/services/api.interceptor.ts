import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppService } from './app.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(private appService: AppService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.appService.token) {
      request = request.clone({
        setHeaders: { AccessCode: environment.ACCESS_CODE, Authorization: this.appService.token, 'X-Referer': window.location.href }
      });
    } else {
      request = request.clone({
        setHeaders: { AccessCode: environment.ACCESS_CODE, 'X-Referer': window.location.href }
      });
    }
    return next.handle(request);
  }
}
