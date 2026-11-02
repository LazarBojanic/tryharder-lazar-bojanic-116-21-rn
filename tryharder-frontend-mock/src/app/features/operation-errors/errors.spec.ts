import { TestBed } from '@angular/core/testing';
import { OperationErrorsComponent } from './errors';
import { AuthService } from '../../services/auth.service';

describe('OperationErrorsComponent', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationErrorsComponent],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
  });

  it('should create and render operation errors table for admin', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(OperationErrorsComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h2')?.textContent).toContain('Operation Error History');
    expect(compiled.querySelector('table')).toBeTruthy();
  });
});
