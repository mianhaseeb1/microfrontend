import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notebook } from '../models/notebook.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class NotebookService {
  private notebooksSubject: BehaviorSubject<Notebook[]>;
  private dataStore: { notebooks: Notebook[] };

  constructor() {
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

  updateNotebook(notebook: Notebook) {
    const index = this.dataStore.notebooks.findIndex(
      (n) => n.id === notebook.id
    );
    this.dataStore.notebooks[index] = notebook;
    this.notebooksSubject.next(Object.assign({}, this.dataStore).notebooks);
  }

  deleteNotebook(id: string) {
    this.dataStore.notebooks = this.dataStore.notebooks.filter(
      (n) => n.id !== id
    );
    this.notebooksSubject.next(Object.assign({}, this.dataStore).notebooks);
  }
}
