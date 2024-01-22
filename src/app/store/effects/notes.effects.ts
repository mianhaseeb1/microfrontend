import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as NotebookActions from '../actions/notes.actions';
import { NotebookService } from '../../services/notebook.service';

@Injectable()
export class NotebookEffects {
  loadNotebooks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.loadNotes),
      mergeMap(() =>
        this.notebookService.notebooks.pipe(
          map((notes) => NotebookActions.notesLoaded({ notes })),
          catchError((error) =>
            of({ type: '[Notebook] Load Notes Failed', error })
          )
        )
      )
    )
  );

  addNotebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.addNotes),
      mergeMap((action) =>
        of(this.notebookService.addNotebook(action.note)).pipe(
          map((note) => NotebookActions.addEmptyNotes({ note })),
          catchError((error) =>
            of({ type: '[Notebook] Add Notebook Failed', error })
          )
        )
      )
    )
  );

  updateNotebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.updateNotes),
      tap((action) => this.notebookService.updateNotebook(action.note)),
      map(() => NotebookActions.loadNotes()),
      catchError((error) =>
        of({ type: '[Notebook] Update Notebook Failed', error })
      )
    )
  );

  deleteNotebook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotebookActions.deleteNotes),
      tap((action) => this.notebookService.deleteNotebook(action.id)),
      map(() => NotebookActions.loadNotes()),
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
