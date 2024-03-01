import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of, throwError } from 'rxjs';
import { Notebook } from '../models/notebook.model';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotebookService {
  private notebooksSubject: BehaviorSubject<Notebook[]>;
  private dataStore: { notebooks: Notebook[] };

  constructor(private http: HttpClient) {
    this.dataStore = { notebooks: [] };
    this.notebooksSubject = new BehaviorSubject<Notebook[]>([]);
  }

  get notebooks(): Observable<Notebook[]> {
    return this.notebooksSubject.asObservable();
  }

  loadAll() {
    this.notebooksSubject.next(Object.assign({}, this.dataStore).notebooks);
  }

  addNotebook(notebook: Notebook) {
    const newNotebook = { ...notebook, id: uuidv4() };
    this.dataStore.notebooks.push(newNotebook);
    this.notebooksSubject.next(Object.assign({}, this.dataStore).notebooks);
    return newNotebook;
  }

  updateNotebook(notebook: Notebook): Observable<Notebook> {
    const index = this.dataStore.notebooks.findIndex(
      (n) => n.id === notebook.id
    );
    if (index !== -1) {
      this.dataStore.notebooks[index] = notebook;
      this.notebooksSubject.next(Object.assign({}, this.dataStore).notebooks);
      return of(notebook);
    } else {
      return throwError(() => new Error('Notebook not found'));
    }
  }

  getNotesByPageId(pageId: string): Observable<Notebook[]> {
    return this.http
      .get<{ notes: Notebook[] }>(`${environment.pagesCards}${pageId}`)
      .pipe(map((response) => response.notes));
  }

  deleteNotebook(id: string) {
    this.dataStore.notebooks = this.dataStore.notebooks.filter(
      (n) => n.id !== id
    );
    this.notebooksSubject.next(Object.assign({}, this.dataStore).notebooks);
  }
}
