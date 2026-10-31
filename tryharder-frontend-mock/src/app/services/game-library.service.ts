import { Injectable, signal } from '@angular/core';
import { GameLibraryEntry } from '../models/game-entry.model';
import { Game } from '../models/game.model';
import { Platform } from '../models/platform.model';
import { MOCK_ENTRIES } from '../mock-data/mock-entries';
import { MOCK_GAMES } from '../mock-data/mock-games';
import { MOCK_PLATFORMS } from '../mock-data/mock-platforms';

export type EntryScope = 'MINE' | 'ALL';

export interface EntryFilter {
  title?: string;
  statuses?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

@Injectable({ providedIn: 'root' })
export class GameLibraryService {
  private _entries = signal<GameLibraryEntry[]>(MOCK_ENTRIES);
  private _games = signal<Game[]>(MOCK_GAMES);
  private _platforms = signal<Platform[]>(MOCK_PLATFORMS);

  get entries() {
    return this._entries.asReadonly();
  }
  get games() {
    return this._games.asReadonly();
  }
  get platforms() {
    return this._platforms.asReadonly();
  }

  getEntryById(id: string): GameLibraryEntry | undefined {
    return this._entries().find((e) => e.id === id && !e.deletedAt);
  }

  getGame(id: string): Game | undefined {
    return this._games().find((g) => g.id === id);
  }

  getPlatform(id: string): Platform | undefined {
    return this._platforms().find((p) => p.id === id);
  }

  search(
    filter: EntryFilter,
    userId: string | null,
    isAdmin: boolean,
    scope: EntryScope = 'MINE',
  ): GameLibraryEntry[] {
    const showAll = isAdmin && scope === 'ALL';
    return this._entries().filter((entry) => {
      if (entry.deletedAt) return false;
      if (!showAll && entry.userId !== userId) return false;

      const game = this._games().find((g) => g.id === entry.gameId);
      if (filter.title && game && !game.title.toLowerCase().includes(filter.title.toLowerCase())) {
        return false;
      }
      if (filter.statuses?.length && !filter.statuses.includes(entry.status)) return false;
      if (filter.dateFrom && entry.createdAt < filter.dateFrom) return false;
      if (filter.dateTo && entry.createdAt > filter.dateTo) return false;
      return true;
    });
  }

  createEntry(gameId: string, platformId: string, userId: string): GameLibraryEntry {
    const now = new Date();
    const entry: GameLibraryEntry = {
      id: crypto.randomUUID(),
      userId,
      gameId,
      platformId,
      status: 'WISHLIST',
      playtimeMinutes: 0,
      rating: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this._entries.update((e) => [...e, entry]);
    return entry;
  }

  updateEntry(
    id: string,
    patch: Partial<Omit<GameLibraryEntry, 'id' | 'userId' | 'createdAt'>>,
  ): GameLibraryEntry | undefined {
    let updated: GameLibraryEntry | undefined;
    this._entries.update((entries) =>
      entries.map((e) => {
        if (e.id === id) {
          updated = { ...e, ...patch, updatedAt: new Date() };
          return updated;
        }
        return e;
      }),
    );
    return updated;
  }

  updateStatus(id: string, status: GameLibraryEntry['status']): GameLibraryEntry | undefined {
    return this.updateEntry(id, { status });
  }

  softDeleteEntry(id: string): void {
    this._entries.update((entries) =>
      entries.map((e) =>
        e.id === id ? { ...e, deletedAt: new Date(), updatedAt: new Date() } : e,
      ),
    );
  }

  addGame(game: Omit<Game, 'id'>): Game {
    const newGame: Game = {
      ...game,
      id: crypto.randomUUID(),
    };
    this._games.update((games) => [...games, newGame]);
    return newGame;
  }

  updateGame(id: string, patch: Partial<Game>): void {
    this._games.update((games) =>
      games.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    );
  }

  deleteGame(id: string): void {
    this._games.update((games) => games.filter((g) => g.id !== id));
  }

  addPlatform(platform: Omit<Platform, 'id'>): Platform {
    const newPlatform: Platform = {
      ...platform,
      id: crypto.randomUUID(),
    };
    this._platforms.update((platforms) => [...platforms, newPlatform]);
    return newPlatform;
  }

  updatePlatform(id: string, patch: Partial<Platform>): void {
    this._platforms.update((platforms) =>
      platforms.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  }

  deletePlatform(id: string): void {
    this._platforms.update((platforms) => platforms.filter((p) => p.id !== id));
  }
}
