import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import * as PageActions from '../actions/pages.actions';
import { PageService } from '../../services/pages.service';
import { IPagesCards, PagesData } from '../../models/pages-cards.model';

@Injectable()
export class PageEffects {
  loadPages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PageActions.loadPages),
      mergeMap((action) =>
        this.pageService.getPages(action.userId).pipe(
          map((pages: IPagesCards) => PageActions.loadPagesSuccess({ pages })),
          catchError((error) => of(PageActions.loadPagesFailure({ error })))
        )
      )
    )
  );

  createPage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PageActions.createPage),
      mergeMap((action) =>
        this.pageService.createPage(action.page).pipe(
          map((page: PagesData) => PageActions.createPageSuccess({ page })),
          catchError((error) => of(PageActions.createPageFailure({ error })))
        )
      )
    )
  );

  refreshPages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PageActions.createPageSuccess),
      map(() => PageActions.loadPages({ userId: 1 }))
    )
  );

  constructor(private actions$: Actions, private pageService: PageService) {}
}
