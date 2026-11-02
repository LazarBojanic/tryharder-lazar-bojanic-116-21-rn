import { TestBed } from '@angular/core/testing';
import { DeveloperService } from './developer.service';

describe('DeveloperService', () => {
  let service: DeveloperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeveloperService);
  });

  it('should be created and initialize with mock developers', () => {
    expect(service).toBeTruthy();
    expect(service.developers().length).toBeGreaterThan(0);
  });

  it('should add, update, and delete a developer', () => {
    const initialLen = service.developers().length;
    const newDev = service.addDeveloper({
      name: 'Kojima Productions',
      country: 'Japan',
      foundedYear: 2015,
      website: 'https://www.kojimaproductions.jp',
    });

    expect(service.developers().length).toBe(initialLen + 1);
    expect(newDev.id).toBeTruthy();

    service.updateDeveloper(newDev.id, { country: 'JP' });
    const updated = service.developers().find((d) => d.id === newDev.id);
    expect(updated?.country).toBe('JP');

    service.deleteDeveloper(newDev.id);
    expect(service.developers().length).toBe(initialLen);
    expect(service.developers().find((d) => d.id === newDev.id)).toBeUndefined();
  });
});
