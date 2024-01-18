import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { PAGES_CARDS } from '../../../data/pages-cards.data';
import { IPagesCards } from '../../../models/pages-cards.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-main-content',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule],
  templateUrl: './home-main-content.component.html',
  styleUrl: './home-main-content.component.scss',
})
export class HomeMainContentComponent {
  activeButton: string = '';
  buttonList: Array<string> = [
    'All',
    'New updates',
    'Shared notebooks',
    'My notebooks',
  ];

  cardItems: Array<IPagesCards> = PAGES_CARDS;

  isActiveButton(button: string): boolean {
    return this.activeButton == button;
  }
  setActiveButton(button: string): void {
    this.activeButton = button;
  }

  getButtonStyle(button: string) {
    if (this.isActiveButton(button)) {
      return { background: '#EEF4FF', color: '#0D3074' };
    } else {
      return { color: 'grey' };
    }
  }
}
