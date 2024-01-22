import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { EditNotebookComponent } from '../../dialogs/edit-notebook/edit-notebook.component';
import { MatDialog } from '@angular/material/dialog';
import { Bookmark } from '../../../models/bookmark.model';
import { BookmarkService } from '../../../services/bookmark.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MESSAGE } from '../../../utils/MESSAGES';
import { DeleteNotebookComponent } from '../../dialogs/delete-notebook/delete-notebook.component';
import { Store } from '@ngrx/store';
import * as BookmarkActions from '../../../store/actions/bookmark.actions';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-bookmark-input',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './bookmark-input.component.html',
  styleUrl: './bookmark-input.component.scss',
})
export class BookmarkInputComponent implements OnInit, AfterViewInit {
  titleValue: string = '';
  navTitle: string = 'New Page';
  inputValue: string = '';
  editMode: boolean = false;
  addingNewBookmark: boolean = false;
  form = this.fb.group({
    title: ['', Validators.required],
    comment: [''],
    links: this.fb.array([this.createLink()]),
  });

  @ViewChildren('textarea') textareas!: QueryList<ElementRef>;
  @Input() item: any;
  @Output() bookmarkAdded = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private bookmarkService: BookmarkService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private store: Store
  ) {}

  edit(bookmarkId: string): void {
    this.dialog.open(EditNotebookComponent, {
      panelClass: 'custom-container',
      width: '460px',
      height: '297px',
      data: {
        title: this.form.controls['title'].value,
        id: bookmarkId,
      },
    });
  }
  ngOnInit(): void {
    if (!this.item || !this.item.id) {
      this.enableEditMode();
      this.addLink();
    } else {
      this.form.patchValue({
        title: this.item.title,
        comment: this.item.comment || '',
        links: this.item.links || [],
      });
      if (this.item.editMode && this.item.title == '') {
        this.enableEditMode();
      }
    }

    if (this.item) {
      this.form.patchValue({
        title: this.item.title,
        comment: this.item.comment || '',
      });
      this.initializeLinks(this.item.links);
    }

    this.bookmarkService.notebookTitle$.subscribe((update) => {
      if (update.id === this.item.id) {
        this.form.controls['title'].setValue(update.newTitle);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.textareas.forEach((textareaRef) => {
        this.adjustTextareaHeightOnInit(textareaRef.nativeElement);
      });
    }, 300);
  }

  onSubmit(): void {
    const formValue = this.form.value;
    const linkStrings = formValue
      .links!.map((linkObj) => linkObj.link.trim())
      .filter((link) => link !== '');

    const isNewBookmark = !this.item || !this.item.id;

    const bookmark: Bookmark = {
      id: isNewBookmark ? this.generateUniqueId() : this.item.id,
      title: formValue.title || '',
      comment: formValue.comment || '',
      links: linkStrings || [],
    };

    if (isNewBookmark) {
      this.store.dispatch(BookmarkActions.addBookmark({ bookmark }));
      this.bookmarkAdded.emit(bookmark.id);
      this.form.reset();
      this.editMode = false;
      this.addingNewBookmark = false;
    } else {
      this.store.dispatch(BookmarkActions.updateBookmark({ bookmark }));
    }

    this._snackBar.open(
      isNewBookmark
        ? 'Bookmark added successfully'
        : 'Bookmark updated successfully'
    );
  }

  initializeLinks(links: string[]): void {
    const linkFormGroups = links.map((link) => this.fb.group({ link }));
    this.form.setControl('links', this.fb.array(linkFormGroups));
  }

  initializeForm(): void {
    this.form = this.fb.group({
      title: [''],
      comment: [''],
      links: this.fb.array([this.createLink()]),
    });
  }

  private generateUniqueId(): string {
    return uuidv4();
  }

  enableEditMode(): void {
    this.editMode = true;
    this.cdr.detectChanges();
  }

  disableEditMode(): void {
    this.editMode = false;
    const updatedBookmark: Bookmark = {
      ...this.item,
      title: this.form.controls['title'].value,
    };
    this.store.dispatch(
      BookmarkActions.updateBookmark({ bookmark: updatedBookmark })
    );
    this.cdr.detectChanges();
  }

  get links(): FormArray {
    return this.form.get('links') as FormArray;
  }

  adjustTextareaHeight(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  adjustTextareaHeightOnInit(textarea: HTMLTextAreaElement): void {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  createLink(): FormGroup {
    return this.fb.group({
      link: [''],
    });
  }

  addLink(): void {
    this.links.push(this.createLink());
  }

  removeLink(index: number): void {
    this.links.removeAt(index);
  }

  onInput(): void {
    const lastInput = this.links.at(this.links.length - 1).value.link;
    if (lastInput && this.links.length === this.links.controls.length) {
      this.addLink();
    }
  }

  delete(id: string, type: string) {
    this.dialog.open(DeleteNotebookComponent, {
      panelClass: 'custom-container',
      width: '312px',
      height: '260px',
      data: {
        id: id,
        type: type,
      },
    });
  }
}
