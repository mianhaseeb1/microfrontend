import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PagesData } from '../models/pages-cards.model';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private dataSource = new BehaviorSubject<PagesData | null>(null);
  private titleSource = new BehaviorSubject<string | null>(null);

  currentData = this.dataSource.asObservable();
  currentTitle = this.titleSource.asObservable();

  private submitSubject = new Subject<string>();
  submitAction$ = this.submitSubject.asObservable();

  triggerSubmit(action: string) {
    this.submitSubject.next(action);
  }

  updateData(data: PagesData | null) {
    this.dataSource.next(data);
  }

  updateTitle(title: string | null) {
    this.titleSource.next(title);
  }
}
