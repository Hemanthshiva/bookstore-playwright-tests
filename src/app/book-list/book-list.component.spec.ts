import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BookListComponent } from './book-list.component';
import { BookService } from '../../service/book.service';
import { of } from 'rxjs';
import { Book } from '../../model/book.model';

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  let bookService: jasmine.SpyObj<BookService>;

  const mockBooks: Book[] = [
    {
      bookId: 1,
      title: 'Test Book 1',
      author: 'Author 1',
      category: 'Fiction',
      price: 9.99,
      coverFileName: 'test1.jpg'
    },
    {
      bookId: 2,
      title: 'Test Book 2',
      author: 'Author 2',
      category: 'Non-Fiction',
      price: 19.99,
      coverFileName: 'test2.jpg'
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('BookService', ['getBooks']);
    spy.getBooks.and.returnValue(of({ items: mockBooks, totalCount: mockBooks.length }));

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        BookListComponent
      ],
      providers: [
        { provide: BookService, useValue: spy }
      ]
    }).compileComponents();

    bookService = TestBed.inject(BookService) as jasmine.SpyObj<BookService>;
    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load books on init', () => {
    expect(bookService.getBooks).toHaveBeenCalled();
    expect(component.books.length).toBe(2);
    expect(component.totalBooks).toBe(2);
  });

  it('should display book cards', () => {
    const bookCards = fixture.nativeElement.querySelectorAll('[data-testid^="book-card-"]');
    expect(bookCards.length).toBe(2);
  });

  it('should display book information correctly', () => {
    const firstBookCard = fixture.nativeElement.querySelector('[data-testid="book-card-1"]');
    const bookTitle = firstBookCard.querySelector('[data-testid="book-title"]');
    const bookAuthor = firstBookCard.querySelector('[data-testid="book-author"]');
    
    expect(bookTitle.textContent).toContain('Test Book 1');
    expect(bookAuthor.textContent).toContain('Author 1');
  });

  it('should filter books by category', fakeAsync(() => {
    const categoryItem = fixture.nativeElement.querySelector('[data-testid="category-item-Fiction"]');
    categoryItem.click();
    tick(300); // debounce time

    expect(bookService.getBooks).toHaveBeenCalledWith(1, 10, '', 'Fiction');
  }));

  it('should search books by query', fakeAsync(() => {
    const searchInput = fixture.nativeElement.querySelector('[data-testid="search-input"]');
    searchInput.value = 'Test Book';
    searchInput.dispatchEvent(new Event('input'));
    tick(300); // debounce time

    expect(bookService.getBooks).toHaveBeenCalledWith(1, 10, 'Test Book', null);
  }));

  it('should show loading spinner while fetching books', () => {
    component.isLoading = true;
    fixture.detectChanges();
    
    const spinner = fixture.nativeElement.querySelector('[data-testid="loading-spinner"]');
    expect(spinner).toBeTruthy();
  });

  it('should show no results message when books array is empty', () => {
    component.books = [];
    component.isLoading = false;
    fixture.detectChanges();

    const noResults = fixture.nativeElement.querySelector('[data-testid="no-results"]');
    expect(noResults).toBeTruthy();
    expect(noResults.textContent).toContain('No books found');
  });

  it('should handle pagination', fakeAsync(() => {
    const paginator = fixture.nativeElement.querySelector('[data-testid="paginator"]');
    expect(paginator).toBeTruthy();

    // Reset the spy calls to ignore the initial load
    bookService.getBooks.calls.reset();
    
    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 20 });
    tick(300); // Wait for debounceTime

    // Verify the last call to getBooks has the correct parameters
    const lastCall = bookService.getBooks.calls.mostRecent();
    expect(lastCall.args).toEqual([2, 10, '', null]);
  }));
});