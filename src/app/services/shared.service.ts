import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PagesData } from '../models/pages-cards.model';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private dataSource = new BehaviorSubject<PagesData | null>(null);
  currentData = this.dataSource.asObservable();

  updateData(data: PagesData | null) {
    this.dataSource.next(data);
  }

}
