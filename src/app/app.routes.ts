import { Routes } from '@angular/router';
import { HomeComponent } from './main/pages/home/home.component';
import { LoginComponent } from './main/pages/login/login.component';
import { NewPageComponent } from './main/pages/new-page/new-page.component';
import { AddBookmarkComponent } from './main/pages/add-bookmark/add-bookmark.component';
import { AddNotesComponent } from './main/pages/add-notes/add-notes.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'new-page', component: NewPageComponent },
  { path: 'add-web-bookmark', component: AddBookmarkComponent },
  { path: 'add-notes', component: AddNotesComponent },
  { path: '', pathMatch: 'full', redirectTo: '/login' },
];
