import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as PagesActions from '../../../store/actions/pages.actions';

@Component({
  selector: 'app-edit-notebook',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './edit-notebook.component.html',
  styleUrl: './edit-notebook.component.scss',
})
export class EditNotebookComponent implements OnInit {
  notebookName: string = '';

  constructor(
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.title) {
      this.notebookName = this.data.title;
    }
  }

  save(): void {
    this.store.dispatch(
      PagesActions.createPage({ page: { title: this.notebookName, userId: 1 } })
    );
  }
}
