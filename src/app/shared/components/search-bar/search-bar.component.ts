import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [SharedModule, CommonModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit {
  searchControl = new FormControl();
  filteredOptions!: Observable<string[]>;
  appsDropdownOpened: boolean = false;
  selectedDataBankOptions: string[] = [];
  url: string = '';
  activeButton: string = '';
  buttons: string[] = ['Data-banks', 'AI’s Own Knowledge'];
  options: string[] = [
    'Create client confirmation email.',
    'Post meeting confirmation',
    'Post cold call email confirmation',
  ];
  dataBankOptions: string[] = [
    'PS Databank',
    'Client files',
    'Marketing files',
  ];
  showDataBankOptions: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.filteredOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  ngOnInit(): void {
    this.route.url.subscribe((urlSegments) => {
      const path = urlSegments.map((segment) => segment.path).join('/');
      this.url = path;
    });
  }

  onCheckboxChange(option: string, isChecked: boolean): void {
    if (isChecked) {
      this.selectedDataBankOptions.push(option);
    } else {
      const index = this.selectedDataBankOptions.indexOf(option);
      if (index !== -1) {
        this.selectedDataBankOptions.splice(index, 1);
      }
    }
  }

  buttonText(button: string): string {
    if (button === 'Data-banks') {
      if (this.selectedDataBankOptions.length > 1) {
        return `${this.selectedDataBankOptions[0]} + ${
          this.selectedDataBankOptions.length - 1
        } more`;
      } else if (this.selectedDataBankOptions.length === 1) {
        return this.selectedDataBankOptions[0];
      }
    }
    return button;
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  }

  openAppsDropdown(): void {
    this.appsDropdownOpened = !this.appsDropdownOpened;
    this.searchControl.setValue('');
  }

  sendMessage(): void {
    this.router.navigate(['/chat-main']);
  }

  isActiveButton(button: string): boolean {
    return this.activeButton == button;
  }
  setActiveButton(button: string): void {
    this.activeButton = button;
    this.showDataBankOptions = button === 'Data-banks';
  }

  getButtonStyle(button: string) {
    if (this.isActiveButton(button)) {
      return { background: '#EEF4FF', color: '#0D3074' };
    } else {
      return { color: 'grey' };
    }
  }
}
