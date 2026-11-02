import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { GameLibraryCreateComponent } from './create';
import { AuthService } from '../../../services/auth.service';
import { GameLibraryService } from '../../../services/game-library.service';

describe('GameLibraryCreateComponent', () => {
  let authService: AuthService;
  let router: Router;
  let libraryService: GameLibraryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLibraryCreateComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    libraryService = TestBed.inject(GameLibraryService);
  });

  it('should render create form', () => {
    const fixture = TestBed.createComponent(GameLibraryCreateComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-select[name="game"], select[name="game"]')).toBeTruthy();
    expect(compiled.querySelector('mat-select[name="platform"], select[name="platform"]')).toBeTruthy();
  });

  it('should successfully create game entry when valid', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const fixture = TestBed.createComponent(GameLibraryCreateComponent);
    const component = fixture.componentInstance;

    component.selectedGameId = 'g1';
    component.selectedPlatformId = 'p1';
    component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith(['/library/search']);
  });
});
