import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { IPagesCards, PagesData } from '../../../models/pages-cards.model';
import { RouterModule } from '@angular/router';
import { Observable, map } from 'rxjs';
import { Store } from '@ngrx/store';
import { loadPages } from '../../../store/actions/pages.actions';
import {
  selectAllPages,
  selectPageError,
} from '../../../store/selectors/pages.selectors';

@Component({
  selector: 'app-home-main-content',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './home-main-content.component.html',
  styleUrl: './home-main-content.component.scss',
})
export class HomeMainContentComponent implements OnInit {
  cardItems$: Observable<IPagesCards> = this.store.select(selectAllPages);
  pageError$: Observable<string> = this.store.select(selectPageError);
  data: PagesData[] = [];

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(loadPages({ userId: 1 }));
  }
}
