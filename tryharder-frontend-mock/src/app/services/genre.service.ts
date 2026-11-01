import { Injectable, signal } from '@angular/core';
import { Genre } from '../models/genre.model';
import { MOCK_GENRES } from '../mock-data/mock-genres';

@Injectable({ providedIn: 'root' })
export class GenreService {
  private _genres = signal<Genre[]>(MOCK_GENRES);

  get genres() {
    return this._genres.asReadonly();
  }

  addGenre(genre: Omit<Genre, 'id'>): Genre {
    const newGenre: Genre = {
      ...genre,
      id: crypto.randomUUID(),
    };
    this._genres.update((genres) => [...genres, newGenre]);
    return newGenre;
  }

  updateGenre(id: string, patch: Partial<Genre>): void {
    this._genres.update((genres) =>
      genres.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  }

  deleteGenre(id: string): void {
    this._genres.update((genres) => genres.filter((g) => g.id !== id));
  }
}
