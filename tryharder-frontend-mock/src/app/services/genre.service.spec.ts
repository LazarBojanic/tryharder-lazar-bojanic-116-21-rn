import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vite-plus/test';
import { GenreService } from './genre.service';

describe('GenreService', () => {
  let service: GenreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GenreService],
    });
    service = TestBed.inject(GenreService);
  });

  it('should be created and have initial genres', () => {
    expect(service).toBeTruthy();
    expect(service.genres().length).toBeGreaterThan(0);
  });

  it('should add a new genre', () => {
    const initialCount = service.genres().length;
    const added = service.addGenre({
      name: 'Horror',
      description: 'Survival and psychological horror games',
    });

    expect(added.id).toBeDefined();
    expect(added.name).toBe('Horror');
    expect(service.genres().length).toBe(initialCount + 1);
  });

  it('should update an existing genre', () => {
    const genre = service.genres()[0];
    service.updateGenre(genre.id, { name: 'Action & Adventure' });

    const updated = service.genres().find((g) => g.id === genre.id);
    expect(updated?.name).toBe('Action & Adventure');
  });

  it('should delete a genre', () => {
    const genre = service.genres()[0];
    const initialCount = service.genres().length;

    service.deleteGenre(genre.id);
    expect(service.genres().length).toBe(initialCount - 1);
    expect(service.genres().find((g) => g.id === genre.id)).toBeUndefined();
  });
});
