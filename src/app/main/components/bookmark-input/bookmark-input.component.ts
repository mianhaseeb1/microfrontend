import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
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
import { Bookmark, BookmarkDTO, BookmarkLink, BookmarkLinkDTO } from '../../../models/bookmark.model';
import { BookmarkService } from '../../../services/bookmark.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MESSAGE } from '../../../utils/MESSAGES';
import { Store } from '@ngrx/store';
import * as BookmarkActions from '../../../store/actions/bookmark.actions';
import { v4 as uuidv4 } from 'uuid';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { SharedService } from '../../../services/shared.service';
import { Tool } from '../../../enums/tools.enum';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bookmark-input',
  standalone: true,
  imports: [SharedModule, CommonModule, CdkDropList, CdkDrag],
  templateUrl: './bookmark-input.component.html',
  styleUrl: './bookmark-input.component.scss',
})
export class BookmarkInputComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  titleValue: string = '';
  inputValue: string = '';
  editMode: boolean = false;
  addingNewBookmark: boolean = false;
  lastDeletedItem: Bookmark | null = null;
  form: FormGroup;
  @Output() scrollRequest = new EventEmitter<void>();
  @ViewChildren('textarea') textareas!: QueryList<ElementRef>;
  @Input() item!: BookmarkDTO;
  @Output() bookmarkAdded = new EventEmitter<string>();
  private saveSubject = new Subject<void>();
  private subscription!: Subscription;
  isInputFocused!: boolean;
  pageId: number = 0;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private bookmarkService: BookmarkService,
    private cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private store: Store,
    private sharedService: SharedService,
    private route: ActivatedRoute
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
    if (!this.item) {

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
          title: [link.url]
        })
      );
      const linksFormArray = this.fb.array(linksFormGroups);
      this.form.setControl('links', linksFormArray);

      // if (this.item.editMode && this.item.title == '') {
      //   this.enableEditMode();
      // }
    }

    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      this.pageId = id;

    });

    if (this.item) {
      this.form.patchValue({
        title: this.item.title,
        comment: this.item.comment || '',
      });
      this.initializeLinks(this.item.links);
    }

    this.subscription = this.sharedService.submitAction$.subscribe((action) => {
      if (action === Tool.BOOKMARK) {
        this.onSubmit();
      }
    });

    // this.bookmarkService.notebookTitle$.subscribe((update) => {
    //   if (update.id == this.item.id) {
    //     this.form.controls['title'].setValue(update.newTitle);
    //   }
    // });
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
    const bookmarkId = this.item.id;
    const linksObjects = formValue
      .links!.map((linkObj: any) => ({
        link: linkObj.link.trim(),
        title: linkObj.url || ''
      }))
      .filter((linkObj: any) => linkObj.link !== '');

    const updateData = {
      title: this.form.value.title,
      comment: this.form.value.comment,
      links: linksObjects
    };
  
    this.store.dispatch(BookmarkActions.updateBookmark({ bookmarkId, data: updateData }));

    this.editMode = false;
    this.addingNewBookmark = false;
  }

  onSubmit(): void {
    this.requestScroll();
    const formValue = this.form.value;
    const linksObjects = formValue
      .links!.map((linkObj: any) => ({
        link: linkObj.link.trim(),
        title: linkObj.url || ''
      }))
      .filter((linkObj: any) => linkObj.link !== '');


    const bookmark: BookmarkDTO = {
      pageId: this.pageId,
      title: formValue.title || '',
      comment: formValue.comment || '',
      links: linksObjects || [],
    };

      this.store.dispatch(BookmarkActions.addBookmark({ bookmark }));

      this.form.reset();
      this.editMode = false;
      this.addingNewBookmark = false;
     this.store.dispatch(BookmarkActions.removeEmptyBookmarks());
     this.store.dispatch(BookmarkActions.loadBookmarks());
    this.requestScroll();
  }

  saveBookmark(): void {
    console.log(this.editMode);
    
    if (this.editMode) {
        this.onEditSubmit();
    } else {
        this.onSubmit();
    }
}

  initializeLinks(links: BookmarkLinkDTO[]): void {
    const linkFormGroups = links.map((item) =>
      this.fb.group({ link: item.link, title: item.url })
    );
    this.form.setControl('links', this.fb.array(linkFormGroups));
  }

  initializeForm(): void {
    this.form = this.fb.group({
      pageId: [''],
      title: [''],
      comment: [''],
      links: this.fb.array([this.createLink()]),
    });
  }

  enableEditMode(): void {
    this.isInputFocused = true;
    
    if (!this.editMode && !this.isLastLinkEmpty()) {
      this.editMode = true;
      this.addLink();

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

  isLastLinkEmpty(): boolean {
    const lastLinkFormGroup = this.links.at(this.links.length - 1) as FormGroup;
    const lastUrl = lastLinkFormGroup.get('link')!.value.trim();
    return !lastUrl;
}

  disableEditMode(): void {
    const formValue = this.form.value;
    const linkInputs = formValue.links || [];
    const bookmarkId = this.item.id;

    const linksObjects = formValue
      .links!.map((linkObj: any) => ({
        link: linkObj.link.trim(),
        image: linkObj.image || '',
        url: linkObj.url || ''
      }))
      .filter((linkObj: any) => linkObj.link !== '');

    const updatedBookmark: BookmarkDTO = {
      ...this.item,
      title: formValue.title || '',
      comment: formValue.comment || '',
      links: linksObjects,
      editMode: false,
    };

    this.store.dispatch(
      BookmarkActions.updateBookmark({bookmarkId, data: updatedBookmark })
    );
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
          console.log(data);
          
          if (data) {
            if (data.image) {
              linkFormGroup.get('image')?.patchValue(data.image);
            }

            linkFormGroup.patchValue({
              link: data.title,
              title: data.url
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
      title: ['']
    });
  }

  // delete(id: string) {
  //   this.lastDeletedItem = this.item;
  //   this.store.dispatch(BookmarkActions.deleteBookmark({ id }));
  //   this.showUndoSnackbar();
  //   this.requestScroll();
  // }

  // private showUndoSnackbar() {
  //   const snackBarRef = this._snackBar.open('Bookmark deleted', 'UNDO', {
  //     duration: 5000,
  //   });

  //   snackBarRef.onAction().subscribe(() => {
  //     if (this.lastDeletedItem) {
  //       this.store.dispatch(
  //         BookmarkActions.addBookmark({ bookmark: this.lastDeletedItem })
  //       );
  //       this.lastDeletedItem = null;
  //     }
  //   });

  //   snackBarRef.afterDismissed().subscribe(() => {
  //     this.lastDeletedItem = null;
  //   });
  //   this.requestScroll();
  // }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
