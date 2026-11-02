import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminComponent } from './admin';
import { AuthService } from '../../services/auth.service';
import { GameLibraryService } from '../../services/game-library.service';
import { DeveloperService } from '../../services/developer.service';
import { GenreService } from '../../services/genre.service';

describe('AdminComponent', () => {
  let authService: AuthService;
  let gameLibrary: GameLibraryService;
  let developerService: DeveloperService;
  let genreService: GenreService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
    gameLibrary = TestBed.inject(GameLibraryService);
    developerService = TestBed.inject(DeveloperService);
    genreService = TestBed.inject(GenreService);
  });

  it('should show permission error message when user lacks USER_READ permission', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('You do not have permission to view this page.');
  });

  it('should display user table when user has USER_READ permission', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Admin Panel – User Management');
    expect(compiled.querySelector('table')).toBeTruthy();
  });

  it('should switch between tabs for global resources', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.selectTab('entries');
    fixture.detectChanges();
    expect(component.currentTabLabel()).toBe('Game Entry Management');

    component.selectTab('games');
    fixture.detectChanges();
    expect(component.currentTabLabel()).toBe('Game Management');

    component.selectTab('developers');
    fixture.detectChanges();
    expect(component.currentTabLabel()).toBe('Developer Management');

    component.selectTab('platforms');
    fixture.detectChanges();
    expect(component.currentTabLabel()).toBe('Platform Management');

    component.selectTab('genres');
    fixture.detectChanges();
    expect(component.currentTabLabel()).toBe('Genre Management');
  });

  it('should show every user game entry in the admin entries tab', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.selectTab('entries');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('All Game Entries');
    expect(compiled.textContent).toContain('Admin User');
    expect(compiled.textContent).toContain('John Gamer');
    expect(compiled.textContent).toContain('Jane Player');
    expect(compiled.textContent).toContain('Elden Ring');
  });

  describe('Game CRUD operations', () => {
    it('should add, edit, and delete a game', async () => {
      await authService.login('admin@tryharder.com', 'admin123');
      const fixture = TestBed.createComponent(AdminComponent);
      const component = fixture.componentInstance;
      component.selectTab('games');
      fixture.detectChanges();

      const initialCount = gameLibrary.games().length;

      component.gameForm = {
        title: 'Dark Souls III',
        releaseYear: 2016,
        developer: 'FromSoftware',
        genre: 'Action RPG',
      };
      component.saveGame();
      fixture.detectChanges();

      expect(gameLibrary.games().length).toBe(initialCount + 1);
      const addedGame = gameLibrary.games().find((g) => g.title === 'Dark Souls III')!;
      expect(addedGame).toBeTruthy();
      expect(addedGame.developer).toBe('FromSoftware');

      component.editGame(addedGame);
      component.gameForm.genre = 'Soulslike';
      component.saveGame();
      fixture.detectChanges();

      const updatedGame = gameLibrary.games().find((g) => g.id === addedGame.id)!;
      expect(updatedGame.genre).toBe('Soulslike');

      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.deleteGame(addedGame.id);
      fixture.detectChanges();

      expect(gameLibrary.games().find((g) => g.id === addedGame.id)).toBeUndefined();
      expect(gameLibrary.games().length).toBe(initialCount);
    });

    it('should show error when required game fields are missing', async () => {
      await authService.login('admin@tryharder.com', 'admin123');
      const fixture = TestBed.createComponent(AdminComponent);
      const component = fixture.componentInstance;
      component.selectTab('games');

      component.gameForm = {
        title: '',
        releaseYear: 0,
        developer: '',
        genre: '',
      };
      component.saveGame();

      expect(component.gameFormError()).toContain('All game fields');
    });
  });

  describe('Developer CRUD operations', () => {
    it('should add, edit, and delete a developer', async () => {
      await authService.login('admin@tryharder.com', 'admin123');
      const fixture = TestBed.createComponent(AdminComponent);
      const component = fixture.componentInstance;
      component.selectTab('developers');
      fixture.detectChanges();

      const initialCount = developerService.developers().length;

      component.developerForm = {
        name: 'Valve',
        country: 'United States',
        foundedYear: 1996,
        website: 'https://valvesoftware.com',
      };
      component.saveDeveloper();
      fixture.detectChanges();

      expect(developerService.developers().length).toBe(initialCount + 1);
      const addedDev = developerService.developers().find((d) => d.name === 'Valve')!;
      expect(addedDev).toBeTruthy();

      component.editDeveloper(addedDev);
      component.developerForm.country = 'USA';
      component.saveDeveloper();
      fixture.detectChanges();

      const updatedDev = developerService.developers().find((d) => d.id === addedDev.id)!;
      expect(updatedDev.country).toBe('USA');

      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.deleteDeveloper(addedDev.id);
      fixture.detectChanges();

      expect(developerService.developers().find((d) => d.id === addedDev.id)).toBeUndefined();
      expect(developerService.developers().length).toBe(initialCount);
    });
  });

  describe('Platform CRUD operations', () => {
    it('should add, edit, and delete a platform', async () => {
      await authService.login('admin@tryharder.com', 'admin123');
      const fixture = TestBed.createComponent(AdminComponent);
      const component = fixture.componentInstance;
      component.selectTab('platforms');
      fixture.detectChanges();

      const initialCount = gameLibrary.platforms().length;

      component.platformForm = {
        name: 'Steam Deck',
      };
      component.savePlatform();
      fixture.detectChanges();

      expect(gameLibrary.platforms().length).toBe(initialCount + 1);
      const addedPlatform = gameLibrary.platforms().find((p) => p.name === 'Steam Deck')!;
      expect(addedPlatform).toBeTruthy();

      component.editPlatform(addedPlatform);
      component.platformForm.name = 'Steam Deck OLED';
      component.savePlatform();
      fixture.detectChanges();

      const updatedPlatform = gameLibrary.platforms().find((p) => p.id === addedPlatform.id)!;
      expect(updatedPlatform.name).toBe('Steam Deck OLED');

      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.deletePlatform(addedPlatform.id);
      fixture.detectChanges();

      expect(gameLibrary.platforms().find((p) => p.id === addedPlatform.id)).toBeUndefined();
      expect(gameLibrary.platforms().length).toBe(initialCount);
    });
  });

  describe('Genre CRUD operations', () => {
    it('should add, edit, and delete a genre', async () => {
      await authService.login('admin@tryharder.com', 'admin123');
      const fixture = TestBed.createComponent(AdminComponent);
      const component = fixture.componentInstance;
      component.selectTab('genres');
      fixture.detectChanges();

      const initialCount = genreService.genres().length;

      component.genreForm = {
        name: 'Souls-like',
        description: 'Challenging action RPG with stamina management and bonfire checkpoints',
      };
      component.saveGenre();
      fixture.detectChanges();

      expect(genreService.genres().length).toBe(initialCount + 1);
      const addedGenre = genreService.genres().find((g) => g.name === 'Souls-like')!;
      expect(addedGenre).toBeTruthy();
      expect(addedGenre.description).toBe('Challenging action RPG with stamina management and bonfire checkpoints');

      component.editGenre(addedGenre);
      component.genreForm.description = 'Updated description';
      component.saveGenre();
      fixture.detectChanges();

      const updatedGenre = genreService.genres().find((g) => g.id === addedGenre.id)!;
      expect(updatedGenre.description).toBe('Updated description');

      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.deleteGenre(addedGenre.id);
      fixture.detectChanges();

      expect(genreService.genres().find((g) => g.id === addedGenre.id)).toBeUndefined();
      expect(genreService.genres().length).toBe(initialCount);
    });
  });
});
