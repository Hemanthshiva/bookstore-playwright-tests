import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../shared/material.module';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, firstValueFrom, of, startWith, switchMap, takeUntil } from 'rxjs';
import { Book } from '../../model/book.model';
import { BookService } from '../../service/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule
  ],
  templateUrl: './book-list.component.html',
  styleUrls: ['./book-list.component.scss']
})
export class BookListComponent implements OnInit, OnDestroy {
  books: Book[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  private readonly searchSubject = new Subject<{query: string; category: string | null}>();
  private readonly destroy$ = new Subject<void>();
  
  // Category filtering
  categories: string[] = [];
  selectedCategory: string | null = null;

  // Pagination
  totalBooks = 0;
  pageSize = 10;
  currentPage = 0;

  constructor(
    private readonly bookService: BookService,
    private readonly cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // First, fetch all books to get the complete category list
    this.fetchCategories();

    // Set up the search and filtering subscription
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged((prev, curr) => 
        prev.query === curr.query && prev.category === curr.category
      ),
      startWith({ query: '', category: null }),
      switchMap(({ query, category }) => {
        this.isLoading = true;
        this.error = null;
        return this.bookService.getBooks(
          this.currentPage + 1, 
          this.pageSize, 
          query,
          category
        ).pipe(
          catchError(error => {
            console.error('Error loading books:', error);
            this.error = error.message;
            this.isLoading = false;
            return of({ items: [], totalCount: 0 });
          })
        );
      })
    ).subscribe({
      next: (response) => {
        this.books = response.items || [];
        this.totalBooks = response.totalCount || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async fetchCategories(): Promise<void> {
    try {
      const response = await firstValueFrom(this.bookService.getBooks(1, 1000));
      const uniqueCategories = Array.from(new Set(response.items.map(book => book.category)));
      this.updateCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error instanceof Error) {
        this.error = error.message;
      }
    }
  }

  private updateCategories(categories: string[] | null | undefined): void {
    // Filter out null or empty categories and sort
    this.categories = (categories || [])
      .filter((category): category is string =>
        Boolean(category && category.trim()))
      .sort((a, b) => a.localeCompare(b));
    this.cdr.detectChanges();
  }

  onSearch(query: string): void {
    this.currentPage = 0;
    this.searchSubject.next({ query, category: this.selectedCategory });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.searchSubject.next({ query: this.searchQuery, category: this.selectedCategory });
  }

  onCategorySelect(category: string | null): void {
    this.selectedCategory = category;
    this.currentPage = 0;
    this.searchSubject.next({ query: this.searchQuery, category });
  }
}