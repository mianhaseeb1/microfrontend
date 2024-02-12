import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PagesData } from '../models/pages-cards.model';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private dataSource = new BehaviorSubject<PagesData | null>(null);
  private titleSource = new BehaviorSubject<string | null>(null);

  currentData = this.dataSource.asObservable();
  currentTitle = this.titleSource.asObservable();

  updateData(data: PagesData | null) {
    this.dataSource.next(data);
  }

  updateTitle(title: string | null) {
    this.titleSource.next(title);
  }
}
