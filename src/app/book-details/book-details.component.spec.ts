import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BookDetailsComponent } from './book-details.component';
import { BookService } from '../../service/book.service';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError, delay } from 'rxjs';
import { routes } from '../app.routes';

describe('BookDetailsComponent', () => {
  let component: BookDetailsComponent;
  let fixture: ComponentFixture<BookDetailsComponent>;
  let bookService: jasmine.SpyObj<BookService>;
  let router: Router;

  const mockBook = {
    bookId: 1,
    title: 'Test Book',
    author: 'Test Author',
    category: 'Test Category',
    price: 9.99,
    coverFileName: 'test.jpg'
  };

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('BookService', ['getBookById']);
    spy.getBookById.and.returnValue(of(mockBook));

    await TestBed.configureTestingModule({
      imports: [
        BookDetailsComponent
      ],
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        provideAnimations(),
        { 
          provide: ActivatedRoute, 
          useValue: { 
            params: of({ id: '1' }) 
          } 
        },
        { provide: BookService, useValue: spy }
      ]
    }).compileComponents();

    bookService = TestBed.inject(BookService) as jasmine.SpyObj<BookService>;
    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load book details', fakeAsync(() => {
    tick(); // Wait for async operations
    fixture.detectChanges();

    expect(bookService.getBookById).toHaveBeenCalledWith(1);

    const titleElement = fixture.nativeElement.querySelector('[data-testid="book-title"]');
    const authorElement = fixture.nativeElement.querySelector('[data-testid="book-author"]');
    const categoryElement = fixture.nativeElement.querySelector('[data-testid="book-category"]');
    const priceElement = fixture.nativeElement.querySelector('[data-testid="book-price"]');

    expect(titleElement.textContent).toContain('Test Book');
    expect(authorElement.textContent).toContain('Test Author');
    expect(categoryElement.textContent).toContain('Test Category');
    expect(priceElement.textContent).toContain('9.99');
  }));

  it('should show loading spinner while fetching book details', fakeAsync(() => {
    // Setup delayed response
    bookService.getBookById.and.returnValue(of(mockBook).pipe(delay(100)));
    
    // Create new component instance
    fixture = TestBed.createComponent(BookDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Check initial loading state
    let bookState: any;
    component.book$.subscribe(state => bookState = state);
    expect(bookState.loading).toBeTrue();
    expect(bookState.data).toBeNull();

    // Complete the loading
    tick(100);
    fixture.detectChanges();
    
    expect(bookState.loading).toBeFalse();
    expect(bookState.data).toEqual(mockBook);
  }));

  it('should show error message when book not found', fakeAsync(() => {
    bookService.getBookById.and.returnValue(throwError(() => ({ status: 404 })));
    
    fixture = TestBed.createComponent(BookDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    tick(); // Wait for async operations

    const errorMessage = fixture.nativeElement.querySelector('[data-testid="error-message"]');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Book not found');
  }));

  it('should navigate back when back button is clicked', fakeAsync(() => {
    tick(); // Wait for initial load
    fixture.detectChanges();
    
    spyOn(router, 'navigate');
    const backButton = fixture.nativeElement.querySelector('[data-testid="back-button"]');
    backButton.click();
    
    expect(router.navigate).toHaveBeenCalledWith(['/books']);
  }));

  it('should display book cover image', fakeAsync(() => {
    tick(); // Wait for async operations
    fixture.detectChanges();

    const coverImage = fixture.nativeElement.querySelector('[data-testid="book-cover"]');
    expect(coverImage).toBeTruthy();
    expect(coverImage.getAttribute('src')).toContain(mockBook.coverFileName);
    expect(coverImage.getAttribute('alt')).toBe(mockBook.title);
  }));

  it('should show book ID', fakeAsync(() => {
    tick(); // Wait for async operations
    fixture.detectChanges();

    const bookIdElement = fixture.nativeElement.querySelector('[data-testid="book-id"]');
    expect(bookIdElement).toBeTruthy();
    expect(bookIdElement.textContent).toContain(mockBook.bookId.toString());
  }));
});