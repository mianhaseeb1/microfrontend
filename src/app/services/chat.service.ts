import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private OPENAI_API_URL = '';
  private headers = new HttpHeaders({
    Authorization: ``,
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  getGptResponse(prompt: string): Observable<any> {
    const data = {
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
    };

    return this.http.post(this.OPENAI_API_URL, data, { headers: this.headers });
  }
}
