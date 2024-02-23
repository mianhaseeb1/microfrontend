import { Component, DoCheck, Input, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { PagesData } from '../../../models/pages-cards.model';
import { Observable, Subject, Subscription, filter, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../../services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { EditNotebookComponent } from '../../../main/dialogs/edit-notebook/edit-notebook.component';
import { loadPages } from '../../../store/actions/pages.actions';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [SharedModule, RouterModule, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit, OnDestroy {
  @Input() item$!: Observable<PagesData | null>;
  @Input() isMain!: boolean;
  title: string | null = null;
  isMainPage: boolean = false;
  private unsubscribe$ = new Subject<void>();
  newTitle: string = '';
  constructor(
    private sharedService: SharedService,
    public dialog: MatDialog,
    private store: Store,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.sharedService.currentTitle.subscribe((title) => {
      this.title = title;
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(() => {
        const currentUrl = this.router.url.split('?')[0];
        const queryParams = this.router.parseUrl(this.router.url).queryParams;
        this.isMainPage =
          currentUrl === '/main' && Object.keys(queryParams).length > 0;
      });
  }

  updateTitle(title: string): void {
    const dialogRef = this.dialog.open(EditNotebookComponent, {
      width: '350px',
      data: {
        title: title,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(loadPages({ userId: 1 }));
        this.sharedService.updateTitle(result);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
