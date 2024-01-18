import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as NotebookActions from '../actions/notebook.actions';
import { NotebookService } from '../services/notebook.service';

@Injectable()
export class NotebookEffects {
  loadNotebooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.loadNotebooks),
      mergeMap(() =>
        this.notebookService.notebooks.pipe(
          map((notebooks) => NotebookActions.notebooksLoaded({ notebooks })),
          catchError((error) =>
            of({ type: '[Notebook] Load Notebooks Failed', error })
          )
        )
      )
    )
  );

  addNotebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.addNotebook),
      mergeMap((action) =>
        of(this.notebookService.addNotebook(action.notebook)).pipe(
          map((notebook) => NotebookActions.addEmptyNotebook({ notebook })),
          catchError((error) =>
            of({ type: '[Notebook] Add Notebook Failed', error })
          )
        )
      )
    )
  );

  updateNotebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.updateNotebook),
      tap((action) => this.notebookService.updateNotebook(action.notebook)),
      map(() => NotebookActions.loadNotebooks()),
      catchError((error) =>
        of({ type: '[Notebook] Update Notebook Failed', error })
      )
    )
  );

  deleteNotebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.deleteNotebook),
      tap((action) => this.notebookService.deleteNotebook(action.id)),
      map(() => NotebookActions.loadNotebooks()),
      catchError((error) =>
        of({ type: '[Notebook] Delete Notebook Failed', error })
      )
    )
  );

  constructor(
    private actions$: Actions,
    private notebookService: NotebookService
  ) {}
}
