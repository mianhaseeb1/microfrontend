import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { IPagesCards, PagesData, PostPages } from '../models/pages-cards.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PageService {
  constructor(private http: HttpClient) {}

  getPages(userId: number): Observable<IPagesCards> {
    return this.http
      .get<IPagesCards>(`${environment.pagesApi}/recent`, {
        params: { userId: userId.toString() },
      })
      .pipe(catchError(this.handleError<IPagesCards>('getPages')));
  }

  createPage(page: { title: string; userId: number }): Observable<PagesData> {
    return this.http
      .post<PagesData>(environment.pagesApi, page)
      .pipe(catchError(this.handleError<PagesData>('createPage')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
