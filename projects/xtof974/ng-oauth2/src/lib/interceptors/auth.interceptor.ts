import { Inject, Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Config, OAuth } from '../models/auth.model';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    @Inject('config') private environment: Config
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.url.includes(this.environment.rsURL)) {
      request = request.clone({
        setHeaders: {
          Authorization: `${OAuth.BEARER} ${this.authService.getToken()}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            const token = this.authService.getToken();
            if (token !== OAuth.ASK_TOKEN) {
              this.authService.initFlow(this.environment.flowType);
            }
          }
        }
        return throwError(error);
      })
    );
  }
}
