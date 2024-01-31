import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthCallbackResponse } from '../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login() {
    return this.http.get(
      'https://auxee-dev-gateway.azurewebsites.net/api/auth/login'
    );
  }

  handleAuthCallback(code: string): Observable<AuthCallbackResponse> {
    return this.http.get<AuthCallbackResponse>(
      `https://auxee-dev-gateway.azurewebsites.net/api/auth/callback?code=${code}`
    );
  }
}
