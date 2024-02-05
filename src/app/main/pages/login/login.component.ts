import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/actions/auth.actions';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loading: boolean = false;

  constructor(private store: Store, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((res) => (this.loading = res['code']));
  }

  login() {
    this.store.dispatch(AuthActions.login());
  }

  handleAuthCallback(code: string) {
    this.store.dispatch(AuthActions.handleAuthCallback({ code }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
