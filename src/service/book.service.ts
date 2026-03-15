import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { Book } from '../model/book.model';
import { environment } from '../environments/environment';
import { MOCK_BOOKS } from '../mock-data';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiUrl = `${environment.apiUrl}/book`;
  
  constructor(private readonly http: HttpClient) { }
  
  getBooks(page: number = 1, pageSize: number = 10, searchQuery: string = '', category: string | null = null): Observable<{items: Book[], totalCount: number}> {
    // Use mock data in development
    if (environment.useMockData) {
      return this.getMockBooks(page, pageSize, searchQuery, category);
    }
    
    return this.http.get<Book[]>(this.apiUrl).pipe(
      retry(3), // Retry failed requests up to 3 times
      map(books => this.filterAndPaginateBooks(books, page, pageSize, searchQuery, category)),
      catchError(error => {
        console.warn('API failed, falling back to mock data');
        // Fallback to mock data if API fails
        return this.getMockBooks(page, pageSize, searchQuery, category);
      })
    );
  }

  private getMockBooks(page: number, pageSize: number, searchQuery: string, category: string | null): Observable<{items: Book[], totalCount: number}> {
    return of(this.filterAndPaginateBooks(MOCK_BOOKS, page, pageSize, searchQuery, category));
  }

  private filterAndPaginateBooks(books: Book[], page: number, pageSize: number, searchQuery: string, category: string | null): {items: Book[], totalCount: number} {
    // Filter by search query if provided
    let filteredBooks = books;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search)
      );
    }
    
    // Filter by category if provided
    if (category) {
      filteredBooks = filteredBooks.filter(book => book.category === category);
    }

    // Handle pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedBooks = filteredBooks.slice(start, end);
    
    return {
      items: paginatedBooks,
      totalCount: filteredBooks.length
    };
  }

  getBookById(id: number): Observable<Book> {
    // For mock data, search in MOCK_BOOKS array
    if (environment.useMockData) {
      const book = MOCK_BOOKS.find(b => b.bookId === id);
      if (book) {
        return of(book);
      }
      return throwError(() => new Error('Book not found'));
    }
    
    return this.http.get<Book>(`${this.apiUrl}/${id}`).pipe(
      retry(3),
      catchError(error => {
        console.error('Error fetching book:', error);
        const errorMessage = error.status === 0 
          ? 'Network error. Please check your internet connection.'
          : 'Book not found or server error.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
