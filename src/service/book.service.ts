import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { Book } from '../model/book.model';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiUrl = 'https://bookcart.azurewebsites.net/api/book';
  
  constructor(private readonly http: HttpClient) { }
  
  getBooks(page: number = 1, pageSize: number = 10, searchQuery: string = '', category: string | null = null): Observable<{items: Book[], totalCount: number}> {
    return this.http.get<Book[]>(this.apiUrl).pipe(
      retry(3), // Retry failed requests up to 3 times
      map(books => {
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
      }),
      catchError(error => {
        console.error('API Error:', error);
        // Provide more specific error information
        const errorMessage = error.status === 0 
          ? 'Network error. Please check your internet connection.'
          : 'Failed to load books. Please try again later.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getBookById(id: number): Observable<Book> {
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
