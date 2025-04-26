import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Book } from '../../model/book.model';
import { BookService } from '../../service/book.service';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule
  ],
  templateUrl: './book-details.component.html',
  styleUrls: ['./book-details.component.scss']
})
export class BookDetailsComponent {
  book$: Observable<{ data: Book | null, loading: boolean, error: string | null }>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bookService: BookService
  ) {
    this.book$ = this.route.params.pipe(
      map(params => Number(params['id'])),
      switchMap(id => this.bookService.getBookById(id).pipe(
        map(book => ({ data: book, loading: false, error: null })),
        catchError(error => {
          const errorMessage = error.status === 404 
            ? 'Book not found'
            : 'Failed to load book details. Please try again later.';
          return of({ data: null, loading: false, error: errorMessage });
        }),
        startWith({ data: null, loading: true, error: null })
      ))
    );
  }

  goBack(): void {
    this.router.navigate(['/books']);
  }
}