import { Component, Inject } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BookmarkService } from '../../../services/bookmark.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MESSAGE } from '../../../utils/MESSAGES';
import { Store } from '@ngrx/store';
import * as BookmarkActions from '../../../store/actions/bookmark.actions';
import * as NotesAction from '../../../store/actions/notes.actions';

@Component({
  selector: 'app-delete-notebook',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './delete-notebook.component.html',
  styleUrl: './delete-notebook.component.scss',
})
export class DeleteNotebookComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notebookService: BookmarkService,
    private _snackBar: MatSnackBar,
    private store: Store
  ) {}

  delete() {
    const id = this.data.id;
    const type = this.data.type;
    if (type == 'bookmark') {
      this.store.dispatch(BookmarkActions.deleteBookmark({ id }));
    } else {
      this.store.dispatch(NotesAction.deleteNotes({ id }));
    }
  }
}
