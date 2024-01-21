import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/actions/auth.actions';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [SharedModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private store: Store, private router: Router) {}

  login() {
    this.store.dispatch(AuthActions.login());
    this.router.navigate(['/home']);
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
