import { Routes } from '@angular/router';
import { HomeComponent } from './main/pages/home/home.component';
import { LoginComponent } from './main/pages/login/login.component';
import { MainComponent } from './main/pages/main/main.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'main', component: MainComponent },
  { path: '', pathMatch: 'full', redirectTo: '/auth/login' },
];
