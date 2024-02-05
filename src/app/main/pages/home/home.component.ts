import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { HomeMainContentComponent } from '../../components/home-main-content/home-main-content.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditNotebookComponent } from '../../dialogs/edit-notebook/edit-notebook.component';
import { Store } from '@ngrx/store';
import { loadPages } from '../../../store/actions/pages.actions';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    SharedModule,
    HomeMainContentComponent,
    NavBarComponent,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  selectedValue!: string;
  constructor(public dialog: MatDialog, private store: Store) {}

  addNotebook(): void {
    const dialogRef = this.dialog.open(EditNotebookComponent, {
      width: '350px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.store.dispatch(loadPages({ userId: 1 }));
    });
  }
}
