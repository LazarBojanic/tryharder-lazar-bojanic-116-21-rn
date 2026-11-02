import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
  });

  it('should create login component', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render login form with email, password inputs and submit button', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should show error when fields are empty on submit', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.error()).toBe('All fields are required.');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('All fields are required.');
  });

  it('should show error on invalid credentials', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    component.email = 'wrong@email.com';
    component.password = 'badpass';
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.error()).toBe('Invalid email or password.');
  });

  it('should navigate to dashboard on successful login', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.email = 'admin@tryharder.com';
    component.password = 'admin123';
    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(authService.currentUser()?.email).toBe('admin@tryharder.com');
  });
});
