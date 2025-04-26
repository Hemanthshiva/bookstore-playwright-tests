import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        AppComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'Book Store' title`, () => {
    expect(component.title).toEqual('Book Store');
  });

  it('should render title', () => {
    const titleElement = fixture.nativeElement.querySelector('[data-testid="app-title"]');
    expect(titleElement.textContent).toContain('Book Store');
  });

  it('should have main content container', () => {
    const mainContent = fixture.nativeElement.querySelector('[data-testid="main-content"]');
    expect(mainContent).toBeTruthy();
  });

  it('should contain router outlet', () => {
    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });
});