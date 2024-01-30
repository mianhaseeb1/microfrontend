import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  handleAuthCallback(code: string) {
    return this.http.get(
      `https://auxee-dev-gateway.azurewebsites.net/api/auth/callback?code=${code}`
    );
  }
}
