import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { Router, RouterModule } from '@angular/router';
import { PagesData } from '../../../models/pages-cards.model';
import { Observable, Subscription } from 'rxjs';
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
export class NavBarComponent {
  @Input() item$!: Observable<PagesData | null>;
  title: string | null = null;

  constructor(
    private sharedService: SharedService,
    public dialog: MatDialog,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit() {
    this.sharedService.currentTitle.subscribe((title) => {
      this.title = title;
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
}
