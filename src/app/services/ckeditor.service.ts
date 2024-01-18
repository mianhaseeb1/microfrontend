import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditorService {
  private editorContents: string[] = [];

  addEditorContent(content: string) {
    this.editorContents.push(content);
  }

  getEditorContents() {
    return this.editorContents;
  }
}
