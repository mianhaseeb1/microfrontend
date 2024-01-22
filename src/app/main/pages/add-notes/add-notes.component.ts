import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { HttpClientModule } from '@angular/common/http';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EditorService } from '../../../services/ckeditor.service';
import { Notebook } from '../../../models/notebook.model';
import { Store } from '@ngrx/store';
import * as NotebookActions from '../../../store/actions/notebook.actions';
import { Subject, debounceTime } from 'rxjs';
@Component({
  selector: 'app-add-notes',
  standalone: true,
  imports: [SharedModule, CommonModule, HttpClientModule, CKEditorModule],
  templateUrl: './add-notes.component.html',
  styleUrl: './add-notes.component.scss',
})
export class AddNotesComponent {
  editorContent: string = '';
  @ViewChild('editor', { static: true }) editorRef!: ElementRef;
  @ViewChild('editorContainer', { static: true })
  editorContainerRef!: ElementRef;
  public editorInstance: any;
  @Input() notebook!: Notebook;
  private contentChange = new Subject<string>();

  constructor(private editorService: EditorService, private store: Store) {
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
    this.store.dispatch(
      NotebookActions.updateNotebook({ notebook: updatedNotebook })
    );
  }

  editorHasContent(): boolean {
    const content = this.editorInstance.getData();
    return content.trim() !== '';
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
