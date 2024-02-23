import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { HomeMainContentComponent } from '../../components/home-main-content/home-main-content.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EditNotebookComponent } from '../../dialogs/edit-notebook/edit-notebook.component';
import { Store } from '@ngrx/store';
import { loadPages } from '../../../store/actions/pages.actions';
import { SharedService } from '../../../services/shared.service';

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
  constructor(
    public dialog: MatDialog,
    private store: Store,
    private router: Router,
    private sharedService: SharedService
  ) {}

  addNotebook(): void {
    const dialogRef = this.dialog.open(EditNotebookComponent, {
      width: '350px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(loadPages({ userId: 1 }));
        this.router.navigate(['/main'], { queryParams: { title: result } });
      }
    });
  }

  toMain() {
    this.sharedService.updateTitle(null);
    this.sharedService.updateData(null);

    this.router.navigate(['/main']);
  }
}
