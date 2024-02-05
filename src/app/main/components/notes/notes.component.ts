import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { HttpClientModule } from '@angular/common/http';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EditorService } from '../../../services/ckeditor.service';
import { Notebook } from '../../../models/notebook.model';
import { Store } from '@ngrx/store';
import * as NotebookActions from '../../../store/actions/notes.actions';
import { Subject, debounceTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [SharedModule, CommonModule, HttpClientModule, CKEditorModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent {
  editorContent: string = '';
  @ViewChild('editor', { static: true }) editorRef!: ElementRef;
  @ViewChild('editorContainer', { static: true })
  editorContainerRef!: ElementRef;
  public editorInstance: any;
  @Input() notebook!: Notebook;
  private contentChange = new Subject<string>();
  lastDeletedNote: Notebook | null = null;

  constructor(
    private editorService: EditorService,
    private store: Store,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {
    this.contentChange.pipe(debounceTime(1000)).subscribe((content) => {
      this.saveNotebookContent(content);
    });
  }

  ngOnInit(): void {
    InlineEditor.create(this.editorRef.nativeElement)
      .then((editor: any) => {
        this.editorInstance = editor;

        if (this.notebook && this.notebook.content) {
          this.editorInstance.setData(this.notebook.content);
        }

        this.editorInstance.model.document.on('change:data', () => {
          const content = this.editorInstance.getData();
          this.contentChange.next(content);
        });

        this.editorInstance.editing.view.document.on('blur', () => {
          const content = this.editorInstance.getData();
          if (content.trim() !== '') {
            this.saveNotebookContent(content);
          }
        });
      })
      .catch((error: any) => {
        console.error('Error occurred in CKEditor: ', error);
      });
  }

  saveOnBlur() {
    if (this.editorInstance && this.editorHasContent()) {
      const content = this.editorInstance.getData();
      console.log('Saving content on blur:', content);
      this.saveNotebookContent(content);
    }
  }

  private saveNotebookContent(content: string) {
    const updatedNotebook = { ...this.notebook, content };
    this.store.dispatch(NotebookActions.updateNotes({ note: updatedNotebook }));
  }

  editorHasContent(): boolean {
    const content = this.editorInstance.getData();
    return content.trim() !== '';
  }

  delete(id: string) {
    this.lastDeletedNote = this.notebook;
    this.store.dispatch(NotebookActions.deleteNotes({ id }));
    this.showUndoSnackbar();
  }

  private showUndoSnackbar() {
    const snackBarRef = this._snackBar.open('Note deleted', 'UNDO', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      if (this.lastDeletedNote) {
        this.store.dispatch(
          NotebookActions.addNotes({ note: this.lastDeletedNote })
        );
        this.lastDeletedNote = null;
      }
    });

    snackBarRef.afterDismissed().subscribe(() => {
      this.lastDeletedNote = null;
    });
  }

  save() {
    const content = this.editorInstance.getData();
    this.editorService.addEditorContent(content);
  }

  ngOnDestroy(): void {
    if (this.editorInstance) {
      this.editorInstance.destroy();
      this.contentChange.unsubscribe();
    }
  }
}
