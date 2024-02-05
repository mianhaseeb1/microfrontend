import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthCallbackResponse } from '../models/auth.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login() {
    return this.http.get(`${environment.authApi}auth/login`);
  }

  handleAuthCallback(code: string): Observable<AuthCallbackResponse> {
    return this.http.get<AuthCallbackResponse>(
      `${environment.authApi}auth/callback?code=${code}`
    );
  }
}
