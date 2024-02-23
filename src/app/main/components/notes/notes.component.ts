import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { HttpClientModule } from '@angular/common/http';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EditorService } from '../../../services/ckeditor.service';
import { Notebook } from '../../../models/notebook.model';
import { Store } from '@ngrx/store';
import * as NotebookActions from '../../../store/actions/notes.actions';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedService } from '../../../services/shared.service';
import { Tool } from '../../../enums/tools.enum';

class UploadAdapter {
  private loader;
  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: any) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ default: reader.result });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
  }
}
@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [SharedModule, CommonModule, HttpClientModule, CKEditorModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.scss',
})
export class NotesComponent implements OnInit, OnDestroy {
  public editorInstance: any;
  @Input() notebook!: Notebook;
  private contentChange = new Subject<string>();
  lastDeletedNote: Notebook | null = null;
  private subscription!: Subscription;
  editor = InlineEditor;
  data: any = ``;
  private blurSubject = new Subject<string>();
  private subscriptions = new Subscription();

  constructor(
    private editorService: EditorService,
    private store: Store,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private sharedService: SharedService
  ) {
    // this.contentChange.pipe(debounceTime(1000)).subscribe((content) => {
    //   this.saveNotebookContent(content);
    // });
  }

  ngOnInit(): void {
    //this.data = this.notebook.content;

    this.subscription = this.sharedService.submitAction$.subscribe((action) => {
      if (action === Tool.NOTE) {
        this.save();
      }
    });

    this.subscriptions.add(
      this.blurSubject.pipe(debounceTime(5000)).subscribe((content) => {
        this.saveNotebookContent(content);
      })
    );
  }

  onEditorChange({ editor }: { editor: any }): void {
    this.data = editor.getData();
  }

  // onEditorBlur(): void {
  //   this.blurSubject.next(this.data);
  // }

  onReady(eventData: any) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (
      loader: any
    ) {
      return new UploadAdapter(loader);
    };
  }

  private saveNotebookContent(content: string) {
    const updatedNotebook = { ...this.notebook, content };
    this.store.dispatch(NotebookActions.updateNotes({ note: updatedNotebook }));
  }

  save() {
    this.editorService.addEditorContent(this.data);
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
