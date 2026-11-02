import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GameLibrarySearchComponent } from './search';
import { AuthService } from '../../../services/auth.service';

describe('GameLibrarySearchComponent', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameLibrarySearchComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService);
  });

  it('should create search component and render search controls', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('input[placeholder="Search by game title"]')).toBeTruthy();
    expect(compiled.querySelector('table')).toBeTruthy();
  });

  it('should show only the admin own entries on the library page', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(2);
    expect(component.filteredEntries().every((entry) => entry.userId === 'u1')).toBe(true);
    expect(component.filteredEntries().some((entry) => entry.id === 'e1')).toBe(false);
  });

  it('should reactively filter entries when title changes', async () => {
    await authService.login('john@tryharder.com', 'gamer123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(2);

    component.title.set('Elden');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(1);
    expect(component.gameTitle(component.filteredEntries()[0].gameId)).toBe('Elden Ring');

    component.title.set('Nonexistent Game Title');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(0);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No entries match the current filters.');
  });

  it('should reactively filter entries when status is toggled', async () => {
    await authService.login('john@tryharder.com', 'gamer123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.toggleStatus('PLAYING');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(1);
    expect(component.filteredEntries()[0].status).toBe('PLAYING');

    component.toggleStatus('BEATEN');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(2);

    component.toggleStatus('PLAYING');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(1);
    expect(component.filteredEntries()[0].status).toBe('BEATEN');
  });

  it('should reactively filter entries when date range changes', async () => {
    await authService.login('john@tryharder.com', 'gamer123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.dateFrom.set('2026-04-01');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(1);

    component.dateTo.set('2026-04-15');
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(1);
    expect(component.filteredEntries()[0].id).toBe('e1');
  });

  it('should open entry details and update status with permission check', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const entry = component.filteredEntries()[0];
    component.openEntryDetails(entry);
    fixture.detectChanges();

    expect(component.selectedEntry()?.id).toBe(entry.id);
    expect(component.canMarkStatus('BEATEN')).toBe(true);

    component.onUpdateStatus(entry, 'BEATEN');
    fixture.detectChanges();

    expect(component.selectedEntry()?.status).toBe('BEATEN');
  });

  it('should edit rating, playtime, and notes and save changes', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const entry = component.filteredEntries()[0];
    component.openEntryDetails(entry);
    fixture.detectChanges();

    component.editForm.rating = 10;
    component.editForm.playtimeMinutes = 1500;
    component.editForm.notes = 'Masterpiece game!';
    component.saveEntryEdit(entry);
    fixture.detectChanges();

    expect(component.selectedEntry()?.rating).toBe(10);
    expect(component.selectedEntry()?.playtimeMinutes).toBe(1500);
    expect(component.selectedEntry()?.notes).toBe('Masterpiece game!');
    expect(component.editMessage()).toContain('saved successfully');
  });

  it('should soft-delete an entry and close details when confirmed', async () => {
    await authService.login('admin@tryharder.com', 'admin123');
    const fixture = TestBed.createComponent(GameLibrarySearchComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const initialCount = component.filteredEntries().length;
    const entryToDelete = component.filteredEntries()[0];
    component.openEntryDetails(entryToDelete);
    fixture.detectChanges();

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    component.deleteEntry(entryToDelete);
    fixture.detectChanges();

    expect(component.filteredEntries().length).toBe(initialCount - 1);
    expect(component.selectedEntry()).toBeNull();
  });
});
