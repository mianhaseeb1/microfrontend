import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/components/nav-bar/nav-bar.component';
import { Store } from '@ngrx/store';
import * as AuthActions from './store/actions/auth.actions';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {
    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        this.store.dispatch(
          AuthActions.handleAuthCallback({ code: params['code'] })
        );
      }
    });
  }
}
