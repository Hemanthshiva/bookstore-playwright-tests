import { Routes } from '@angular/router';
import { BookListComponent } from './book-list/book-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { 
    path: 'books',
    component: BookListComponent,
    data: { animation: 'list' }
  },
  { 
    path: 'books/:id',
    loadComponent: () => import('./book-details/book-details.component').then(m => m.BookDetailsComponent),
    data: { animation: 'details' }
  }
];
