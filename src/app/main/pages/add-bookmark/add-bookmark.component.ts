import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';
import { BookmarkInputComponent } from '../../components/bookmark-input/bookmark-input.component';

@Component({
  selector: 'app-add-bookmark',
  standalone: true,
  imports: [
    SharedModule,
    NavBarComponent,
    CommonModule,
    BookmarkInputComponent,
  ],
  templateUrl: './add-bookmark.component.html',
  styleUrl: './add-bookmark.component.scss',
})
export class AddBookmarkComponent {
  navTitle: string = 'New Page';
}
