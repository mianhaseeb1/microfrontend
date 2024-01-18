import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { HomeMainContentComponent } from '../../components/home-main-content/home-main-content.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { NavBarComponent } from '../../../shared/components/nav-bar/nav-bar.component';
import { RouterModule } from '@angular/router';

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

  isSelected(value: string): boolean {
    return this.selectedValue === value;
  }
}
