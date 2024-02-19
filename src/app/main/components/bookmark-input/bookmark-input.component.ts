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
import { Bookmark, BookmarkLink } from '../../../models/bookmark.model';
import { BookmarkService } from '../../../services/bookmark.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MESSAGE } from '../../../utils/MESSAGES';
import { Store } from '@ngrx/store';
import * as BookmarkActions from '../../../store/actions/bookmark.actions';
import { v4 as uuidv4 } from 'uuid';
import { Subject, debounceTime } from 'rxjs';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-bookmark-input',
  standalone: true,
  imports: [SharedModule, CommonModule, CdkDropList, CdkDrag],
  templateUrl: './bookmark-input.component.html',
  styleUrl: './bookmark-input.component.scss',
})
export class BookmarkInputComponent implements OnInit, AfterViewInit {
  titleValue: string = '';
  inputValue: string = '';
  editMode: boolean = false;
  addingNewBookmark: boolean = false;
  lastDeletedItem: Bookmark | null = null;
  form: FormGroup;
  @Output() scrollRequest = new EventEmitter<void>();
  @ViewChildren('textarea') textareas!: QueryList<ElementRef>;
  @Input() item!: Bookmark;
  @Output() bookmarkAdded = new EventEmitter<string>();
  private saveSubject = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private bookmarkService: BookmarkService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private store: Store
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      comment: [''],
      links: this.fb.array([this.createLink()]),
    });
  }

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

  requestScroll() {
    this.scrollRequest.emit();
  }

  ngOnInit(): void {
    if (!this.item || !this.item.id) {
      this.enableEditMode();
      this.addLink();
    } else {
      this.form.patchValue({
        title: this.item.title,
        comment: this.item.comment || '',
      });

      const linksFormGroups = this.item.links.map((link) =>
        this.fb.group({
          link: [link.link, Validators.required],
          image: [link.image],
        })
      );
      const linksFormArray = this.fb.array(linksFormGroups);
      this.form.setControl('links', linksFormArray);

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

    this.saveSubject.pipe(debounceTime(3000)).subscribe(() => {
      this.onEditSubmit();
    });

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

  clearTitle() {
    this.form.get('title')!.setValue('');
  }

  onEditSubmit() {
    const formValue = this.form.value;

    const linksObjects = formValue
      .links!.map((linkObj: any) => ({
        link: linkObj.link.trim(),
        image: linkObj.image || '',
      }))
      .filter((linkObj: any) => linkObj.link !== '');

    console.log(linksObjects);

    const isNewBookmark = !this.item || !this.item.id;

    const bookmark: Bookmark = {
      id: isNewBookmark ? this.generateUniqueId() : this.item.id,
      title: formValue.title || '',
      comment: formValue.comment || '',
      links: linksObjects || [],
    };

    console.log(bookmark);

    this.store.dispatch(BookmarkActions.updateBookmark({ bookmark }));

    this.editMode = false;
    this.addingNewBookmark = false;
  }

  onSubmit(): void {
    this.requestScroll();
    const formValue = this.form.value;
    const linksObjects = formValue
      .links!.map((linkObj: any) => ({
        link: linkObj.link.trim(),
        image: linkObj.image || '',
      }))
      .filter((linkObj: any) => linkObj.link !== '');

    console.log(linksObjects);

    const isNewBookmark = !this.item || !this.item.id;

    const bookmark: Bookmark = {
      id: isNewBookmark ? this.generateUniqueId() : this.item.id,
      title: formValue.title || '',
      comment: formValue.comment || '',
      links: linksObjects || [],
    };

    if (isNewBookmark) {
      this.store.dispatch(BookmarkActions.addBookmark({ bookmark }));
      this.bookmarkAdded.emit(bookmark.id);
      this.form.reset();
      this.editMode = false;
      this.addingNewBookmark = false;
      this._snackBar.open(MESSAGE.successfully_added_bookmark);
    } else {
      this.store.dispatch(BookmarkActions.updateBookmark({ bookmark }));
      this._snackBar.open(MESSAGE.successfully_updated_bookmark);
    }

    this.requestScroll();
  }

  initializeLinks(links: BookmarkLink[]): void {
    const linkFormGroups = links.map((item) =>
      this.fb.group({ link: item.link, image: item.image })
    );
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
    if (!this.editMode) {
      this.editMode = true;
      const lastLink = this.links.at(this.links.length - 1).value.link.trim();

      if (lastLink !== '') {
        this.addLink();
      }

      this.cdr.detectChanges();
    }
  }

  onLinkInputFocus(index: number): void {
    const isLastInput = index === this.links.length - 1;
    const lastInputValue = this.links
      .at(this.links.length - 1)
      .value.link.trim();
    if (this.editMode && isLastInput && lastInputValue !== '') {
      this.addLink();
    }
  }

  disableEditMode(): void {
    const formValue = this.form.value;
    const linkInputs = formValue.links || [];

    const linksObjects = formValue
      .links!.map((linkObj: any) => ({
        link: linkObj.link.trim(),
        image: linkObj.image || '',
      }))
      .filter((linkObj: any) => linkObj.link !== '');

    const updatedBookmark: Bookmark = {
      ...this.item,
      title: formValue.title || '',
      comment: formValue.comment || '',
      links: linksObjects,
      editMode: false,
    };

    this.store.dispatch(
      BookmarkActions.updateBookmark({ bookmark: updatedBookmark })
    );
    this._snackBar.open(MESSAGE.successfully_updated_bookmark);
    this.requestScroll();
    this.editMode = false;
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
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  addLink(): void {
    this.requestScroll();
    this.links.push(this.createLink());
  }

  removeLink(index: number): void {
    if (
      this.links.length > 1 &&
      !(
        index === this.links.length - 1 &&
        this.links.at(index).value.link.trim() === ''
      )
    ) {
      this.links.removeAt(index);
    }
  }

  onInput(index: number): void {
    const linkFormGroup = this.links.at(index) as FormGroup;
    const url = linkFormGroup.get('link')!.value.trim();
    if (url) {
      this.bookmarkService.getLinkPreview(url).subscribe({
        next: (data) => {
          if (data) {
            if (data.image) {
              linkFormGroup.get('image')?.patchValue(data.image);
            }

            linkFormGroup.patchValue({
              link: data.title,
              image: data.image,
            });
            this.cdr.detectChanges();
          }
        },
        error: (error) => console.error('Error fetching link preview:', error),
      });
    }

    if (index === this.links.length - 1 && url) {
      this.addLink();
    }
  }

  createLink(): FormGroup {
    return this.fb.group({
      link: ['', Validators.required],
      image: [''],
    });
  }

  delete(id: string) {
    this.lastDeletedItem = this.item;
    this.store.dispatch(BookmarkActions.deleteBookmark({ id }));
    this.showUndoSnackbar();
    this.requestScroll();
  }

  private showUndoSnackbar() {
    const snackBarRef = this._snackBar.open('Bookmark deleted', 'UNDO', {
      duration: 5000,
    });

    snackBarRef.onAction().subscribe(() => {
      if (this.lastDeletedItem) {
        this.store.dispatch(
          BookmarkActions.addBookmark({ bookmark: this.lastDeletedItem })
        );
        this.lastDeletedItem = null;
      }
    });

    snackBarRef.afterDismissed().subscribe(() => {
      this.lastDeletedItem = null;
    });
    this.requestScroll();
  }
}
