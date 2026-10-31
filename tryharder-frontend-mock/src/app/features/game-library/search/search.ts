import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { GameLibraryService, EntryFilter } from '../../../services/game-library.service';
import { DeveloperService } from '../../../services/developer.service';
import { AuthService } from '../../../services/auth.service';
import {GameStatus, GameLibraryEntry, allGameStatuses} from '../../../models/game-entry.model';
import { Game } from '../../../models/game.model';
import { Platform } from '../../../models/platform.model';
import { Developer } from '../../../models/developer.model';
import { GAME_ENTRY_PERMISSIONS, Permission } from '../../../models/permission.model';

@Component({
  selector: 'app-game-library-search',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold text-gray-800">My Game Library</h2>
        <p class="text-sm text-gray-500">
          Track, manage, and update your game collection, status, ratings, and notes
        </p>
      </div>

      <mat-card>
        <mat-card-header class="mb-2">
          <mat-card-title class="!text-lg">Filter Library Entries</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="flex flex-col gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Search by Title</mat-label>
              <input
                matInput
                [ngModel]="title()"
                (ngModelChange)="title.set($event)"
                placeholder="Search by game title"
              />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-gray-700">Filter by Status</label>
              <div class="flex flex-wrap gap-4">
                @for (status of allGameStatuses; track status) {
                  <mat-checkbox
                    [checked]="selectedStatuses().includes(status)"
                    (change)="toggleStatus(status)"
                  >
                    {{ status }}
                  </mat-checkbox>
                }
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Created from</mat-label>
                <input
                  matInput
                  type="date"
                  [ngModel]="dateFrom()"
                  (ngModelChange)="dateFrom.set($event)"
                />
              </mat-form-field>
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Created to</mat-label>
                <input
                  matInput
                  type="date"
                  [ngModel]="dateTo()"
                  (ngModelChange)="dateTo.set($event)"
                />
              </mat-form-field>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      @if (selectedEntry(); as entry) {
        @if (getGame(entry.gameId); as game) {
          <mat-card class="border-2 border-indigo-200">
            <mat-card-header class="mb-4">
              <mat-card-title class="!text-xl !font-bold flex items-center gap-2">
                <mat-icon color="primary">videogame_asset</mat-icon>
                <span>Game Entry Details: {{ game.title }}</span>
              </mat-card-title>
              <mat-card-subtitle>
                Manage status, platform, playtime, rating, and notes
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="flex flex-col items-center gap-3 rounded border border-gray-200 bg-gray-50 p-4 text-center">
                  @if (game.coverImageUrl) {
                    <img
                      [src]="game.coverImageUrl"
                      [alt]="game.title"
                      class="h-64 w-48 rounded object-contain bg-white shadow-sm border border-gray-300"
                    />
                  } @else {
                    <div class="flex h-64 w-48 items-center justify-center rounded bg-gray-100 text-gray-400 border border-gray-300">
                      <mat-icon class="!text-5xl">image</mat-icon>
                    </div>
                  }

                  <div class="flex flex-col gap-1 w-full">
                    <h3 class="font-bold text-gray-900 text-base">{{ game.title }}</h3>
                    <p class="text-xs text-gray-500">{{ game.releaseYear }} &bull; {{ game.genre }}</p>

                    @if (getDeveloper(game.developer); as dev) {
                      <div class="mt-2 flex items-center justify-center gap-2 rounded bg-white p-1.5 border border-gray-200">
                        @if (dev.logoUrl) {
                          <img
                            [src]="dev.logoUrl"
                            [alt]="dev.name"
                            class="h-7 w-7 rounded object-contain bg-white border border-gray-200 p-0.5 shrink-0"
                          />
                        }
                        <span class="text-xs font-semibold text-gray-700">{{ dev.name }}</span>
                      </div>
                    } @else {
                      <span class="text-xs text-gray-600 font-medium">Dev: {{ game.developer }}</span>
                    }
                  </div>
                </div>

                <div class="md:col-span-2 flex flex-col gap-4">
                  <div class="flex flex-col gap-2">
                    <label class="text-sm font-semibold text-gray-700">Update Game Status</label>
                    <div class="flex flex-wrap gap-2">
                      @for (st of allGameStatuses; track st) {
                        <button
                          mat-stroked-button
                          type="button"
                          [color]="entry.status === st ? 'primary' : undefined"
                          [disabled]="!canUpdate()"
                          (click)="onUpdateStatus(entry, st)"
                          [class.!bg-indigo-50]="entry.status === st"
                          [class.!font-bold]="entry.status === st"
                        >
                          <mat-icon *ngIf="entry.status === st" class="text-xs">check</mat-icon>
                          <span>{{ st }}</span>
                        </button>
                      }
                    </div>
                    @if (!canUpdate()) {
                      <p class="text-xs text-amber-700">
                        * You do not have permissions to modify this entry.
                      </p>
                    }
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Platform</mat-label>
                      <mat-select
                        [(ngModel)]="editForm.platformId"
                        name="editPlatform"
                        [disabled]="!canUpdate()"
                      >
                        @for (p of library.platforms(); track p.id) {
                          <mat-option [value]="p.id">{{ p.name }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Rating (1 - 10)</mat-label>
                      <mat-select
                        [(ngModel)]="editForm.rating"
                        name="editRating"
                        [disabled]="!canUpdate()"
                      >
                        <mat-option [value]="null">No Rating</mat-option>
                        @for (r of [1,2,3,4,5,6,7,8,9,10]; track r) {
                          <mat-option [value]="r">{{ r }} / 10</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Playtime (Minutes)</mat-label>
                      <input
                        matInput
                        type="number"
                        min="0"
                        [(ngModel)]="editForm.playtimeMinutes"
                        name="editPlaytime"
                        [disabled]="!canUpdate()"
                        placeholder="0"
                      />
                      <span matSuffix class="text-xs text-gray-500 pr-2">
                        ({{ formatPlaytimeHours(editForm.playtimeMinutes) }})
                      </span>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Personal Notes & Review</mat-label>
                    <textarea
                      matInput
                      rows="3"
                      [(ngModel)]="editForm.notes"
                      name="editNotes"
                      [disabled]="!canUpdate()"
                      placeholder="Add personal thoughts, progress notes, or gameplay review..."
                    ></textarea>
                  </mat-form-field>

                  <div class="flex flex-wrap items-center justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                    <span>Added: {{ entry.createdAt | date: 'medium' }}</span>
                    <span>Last Updated: {{ entry.updatedAt | date: 'medium' }}</span>
                  </div>

                  @if (editMessage()) {
                    <div class="rounded bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                      {{ editMessage() }}
                    </div>
                  }

                  <div class="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      mat-flat-button
                      color="primary"
                      type="button"
                      [disabled]="!canUpdate()"
                      (click)="saveEntryEdit(entry)"
                    >
                      <mat-icon>save</mat-icon>
                      <span>Save Changes</span>
                    </button>

                    @if (canDelete()) {
                      <button
                        mat-stroked-button
                        color="warn"
                        type="button"
                        (click)="deleteEntry(entry)"
                        class="!text-red-600 !border-red-300"
                      >
                        <mat-icon>delete</mat-icon>
                        <span>Delete Entry</span>
                      </button>
                    }

                    <button
                      mat-stroked-button
                      type="button"
                      (click)="closeEntryDetails()"
                    >
                      <mat-icon>close</mat-icon>
                      <span>Close</span>
                    </button>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }
      }

      <mat-card>
        <mat-card-content class="!p-0">
          <table mat-table [dataSource]="filteredEntries()" class="w-full">
            <ng-container matColumnDef="game">
              <th mat-header-cell *matHeaderCellDef>Game</th>
              <td mat-cell *matCellDef="let entry" class="py-2">
                <div class="flex items-center gap-3">
                  @if (getGame(entry.gameId)?.coverImageUrl; as cover) {
                    <img
                      [src]="cover"
                      [alt]="gameTitle(entry.gameId)"
                      class="h-16 w-12 rounded object-contain bg-white shadow-xs border border-gray-200 shrink-0"
                    />
                  } @else {
                    <div class="flex h-16 w-12 shrink-0 items-center justify-center rounded bg-gray-100 text-gray-400 border border-gray-200">
                      <mat-icon class="text-xs">videogame_asset</mat-icon>
                    </div>
                  }
                  <div class="flex flex-col">
                    <span class="font-medium text-gray-900">{{ gameTitle(entry.gameId) }}</span>
                    <span class="text-xs text-gray-500">
                      {{ getGame(entry.gameId)?.releaseYear }} &bull; {{ getGame(entry.gameId)?.genre }}
                    </span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="developer">
              <th mat-header-cell *matHeaderCellDef>Developer</th>
              <td mat-cell *matCellDef="let entry">
                <div class="flex items-center gap-1.5">
                  @if (getDeveloperForEntry(entry.gameId)?.logoUrl; as logo) {
                    <img
                      [src]="logo"
                      [alt]="getDeveloperForEntry(entry.gameId)?.name"
                      class="h-5 w-5 rounded object-contain bg-white border border-gray-200 p-0.5 shrink-0"
                    />
                  }
                  <span class="text-sm text-gray-700">
                    {{ getGame(entry.gameId)?.developer ?? '-' }}
                  </span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="platform">
              <th mat-header-cell *matHeaderCellDef>Platform</th>
              <td mat-cell *matCellDef="let entry">
                {{ platformName(entry.platformId) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let entry">
                <mat-chip-set>
                  <mat-chip [highlighted]="entry.status === 'BEATEN' || entry.status === 'PLATINUM' || entry.status === 'PLAYING'">
                    {{ entry.status }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="rating">
              <th mat-header-cell *matHeaderCellDef>Rating</th>
              <td mat-cell *matCellDef="let entry">
                @if (entry.rating !== null && entry.rating !== undefined) {
                  <span class="font-semibold text-amber-700">&#9733; {{ entry.rating }}/10</span>
                } @else {
                  <span class="text-gray-400 text-xs">-</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="playtime">
              <th mat-header-cell *matHeaderCellDef>Playtime</th>
              <td mat-cell *matCellDef="let entry">
                <span class="text-sm text-gray-700">{{ formatPlaytime(entry.playtimeMinutes) }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Created</th>
              <td mat-cell *matCellDef="let entry">
                {{ entry.createdAt | date: 'shortDate' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let entry">
                <div class="flex items-center gap-1">
                  <button
                    mat-stroked-button
                    color="primary"
                    size="small"
                    (click)="openEntryDetails(entry)"
                  >
                    <mat-icon class="text-xs">tune</mat-icon>
                    <span>Manage</span>
                  </button>
                  @if (canDelete()) {
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="deleteEntry(entry)"
                      title="Delete Entry"
                      class="!text-red-500"
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns;"
              class="hover:bg-gray-50/80 cursor-pointer"
              [class.bg-indigo-50]="selectedEntry()?.id === row.id"
            ></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell px-4 py-8 text-center text-gray-500" [attr.colspan]="displayedColumns.length">
                No entries match the current filters.
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class GameLibrarySearchComponent {
  readonly library = inject(GameLibraryService);
  private developerService = inject(DeveloperService);
  readonly auth = inject(AuthService);
  protected readonly allGameStatuses = allGameStatuses;
  readonly displayedColumns: string[] = [
    'game',
    'developer',
    'platform',
    'status',
    'rating',
    'playtime',
    'createdAt',
    'actions',
  ];

  readonly title = signal('');
  readonly selectedStatuses = signal<string[]>([]);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');

  readonly selectedEntry = signal<GameLibraryEntry | null>(null);
  readonly editMessage = signal('');

  editForm = {
    platformId: '',
    rating: null as number | null,
    playtimeMinutes: 0,
    notes: '',
  };

  readonly filteredEntries = computed(() => {
    const user = this.auth.currentUser();
    const isAdmin = user?.role === 'ADMIN';
    const filter: EntryFilter = {
      title: this.title() || undefined,
      statuses: this.selectedStatuses().length ? this.selectedStatuses() : undefined,
      dateFrom: this.dateFrom() ? new Date(this.dateFrom()) : undefined,
      dateTo: this.dateTo() ? new Date(this.dateTo()) : undefined,
    };
    return this.library.search(filter, user?.id ?? null, isAdmin, 'MINE');
  });

  toggleStatus(status: string): void {
    this.selectedStatuses.update((current) => {
      const idx = current.indexOf(status);
      if (idx >= 0) {
        return current.filter((s) => s !== status);
      } else {
        return [...current, status];
      }
    });
  }

  gameTitle(gameId: string): string {
    return this.getGame(gameId)?.title ?? gameId;
  }

  platformName(platformId: string): string {
    return this.library.platforms().find((p) => p.id === platformId)?.name ?? platformId;
  }

  getGame(gameId: string): Game | undefined {
    return this.library.games().find((g) => g.id === gameId);
  }

  getDeveloper(developerName: string): Developer | undefined {
    return this.developerService.getDeveloperByName(developerName);
  }

  getDeveloperForEntry(gameId: string): Developer | undefined {
    const game = this.getGame(gameId);
    if (!game) return undefined;
    return this.getDeveloper(game.developer);
  }

  canUpdate(): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return this.auth.hasPermission(GAME_ENTRY_PERMISSIONS[2]);
  }

  canMarkStatus(status?: string): boolean {
    return this.canUpdate();
  }

  canDelete(): boolean {
    const user = this.auth.currentUser();
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return this.auth.hasPermission(GAME_ENTRY_PERMISSIONS[3]);
  }

  openEntryDetails(entry: GameLibraryEntry): void {
    this.selectedEntry.set(entry);
    this.editMessage.set('');
    this.editForm = {
      platformId: entry.platformId,
      rating: entry.rating,
      playtimeMinutes: entry.playtimeMinutes,
      notes: entry.notes ?? '',
    };
  }

  closeEntryDetails(): void {
    this.selectedEntry.set(null);
    this.editMessage.set('');
  }

  onUpdateStatus(entry: GameLibraryEntry, status: GameStatus): void {
    if (!this.canUpdate()) return;
    const updated = this.library.updateStatus(entry.id, status);
    if (updated) {
      this.selectedEntry.set(updated);
      this.editMessage.set(`Status updated to ${status}.`);
    }
  }

  saveEntryEdit(entry: GameLibraryEntry): void {
    if (!this.canUpdate()) return;
    const updated = this.library.updateEntry(entry.id, {
      platformId: this.editForm.platformId,
      rating: this.editForm.rating,
      playtimeMinutes: Number(this.editForm.playtimeMinutes) || 0,
      notes: this.editForm.notes || null,
    });
    if (updated) {
      this.selectedEntry.set(updated);
      this.editMessage.set('Entry details saved successfully!');
    }
  }

  deleteEntry(entry: GameLibraryEntry): void {
    if (!this.canDelete()) return;
    if (confirm(`Remove this game entry from your library?`)) {
      this.library.softDeleteEntry(entry.id);
      if (this.selectedEntry()?.id === entry.id) {
        this.closeEntryDetails();
      }
    }
  }

  formatPlaytime(minutes: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  }

  formatPlaytimeHours(minutes: number): string {
    const m = Number(minutes) || 0;
    const hrs = (m / 60).toFixed(1);
    return `${hrs} hrs`;
  }

}
