import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GameLibraryService } from '../../../services/game-library.service';
import { DeveloperService } from '../../../services/developer.service';
import { AuthService } from '../../../services/auth.service';
import {GAME_ENTRY_PERMISSIONS} from '../../../models/permission.model';

@Component({
  selector: 'app-game-library-create',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="mx-auto max-w-xl">
      <mat-card>
        <mat-card-header class="mb-4">
          <mat-card-title class="text-xl! font-bold!">Add Game to Library</mat-card-title>
          <mat-card-subtitle>Track a new game entry in your personal backlog</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Game</mat-label>
              <mat-select [(ngModel)]="selectedGameId" name="game" required>
                <mat-option value="" disabled>Select a game</mat-option>
                @for (game of library.games(); track game.id) {
                  <mat-option [value]="game.id">{{ game.title }} ({{ game.releaseYear }})</mat-option>
                }
              </mat-select>
            </mat-form-field>

            @if (selectedGame(); as game) {
              <div class="flex items-center gap-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                @if (game.coverImageUrl) {
                  <img
                    [src]="game.coverImageUrl"
                    [alt]="game.title"
                    class="h-28 w-20 rounded object-contain bg-white shadow-xs border border-gray-300 shrink-0"
                  />
                }
                <div class="flex flex-col gap-0.5">
                  <span class="font-bold text-gray-900">{{ game.title }}</span>
                  <span class="text-xs text-gray-600">{{ game.releaseYear }} &bull; {{ game.genre }}</span>
                  <div class="flex items-center gap-1.5 pt-1">
                    @if (selectedDeveloper(); as dev) {
                      @if (dev.logoUrl) {
                        <img
                          [src]="dev.logoUrl"
                          [alt]="dev.name"
                          class="h-5 w-5 rounded object-contain bg-white border border-gray-200 p-0.5 shrink-0"
                        />
                      }
                      <span class="text-xs font-medium text-gray-700">{{ dev.name }}</span>
                    } @else {
                      <span class="text-xs text-gray-600">{{ game.developer }}</span>
                    }
                  </div>
                </div>
              </div>
            }

            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Platform</mat-label>
              <mat-select [(ngModel)]="selectedPlatformId" name="platform" required>
                <mat-option value="" disabled>Select a platform</mat-option>
                @for (platform of library.platforms(); track platform.id) {
                  <mat-option [value]="platform.id">{{ platform.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="rounded bg-blue-50 p-3 text-sm text-blue-700 border border-blue-200">
              Status will be set to <strong>WISHLIST</strong> automatically upon creation.
            </div>

            @if (error()) {
              <div class="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {{ error() }}
              </div>
            }

            <div class="flex items-center gap-3 pt-2">
              <button
                mat-flat-button
                color="primary"
                type="submit"
                [disabled]="!canSave()"
              >
                <mat-icon>check</mat-icon>
                <span>Create Entry</span>
              </button>
              <button
                mat-stroked-button
                type="button"
                (click)="cancel()"
              >
                <mat-icon>close</mat-icon>
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class GameLibraryCreateComponent {
  readonly library = inject(GameLibraryService);
  private developerService = inject(DeveloperService);
  private auth = inject(AuthService);
  private router = inject(Router);

  selectedGameId = '';
  selectedPlatformId = '';
  error = signal('');

  selectedGame = computed(() => {
    if (!this.selectedGameId) return undefined;
    return this.library.games().find((g) => g.id === this.selectedGameId);
  });

  selectedDeveloper = computed(() => {
    const game = this.selectedGame();
    if (!game) return undefined;
    return this.developerService.getDeveloperByName(game.developer);
  });

  canSave(): boolean {
    return (
      !!this.selectedGameId &&
      !!this.selectedPlatformId &&
      this.auth.hasPermission(GAME_ENTRY_PERMISSIONS[0])
    );
  }

  onSubmit(): void {
    this.error.set('');
    if (!this.selectedGameId || !this.selectedPlatformId) {
      this.error.set('Both fields are required.');
      return;
    }
    const user = this.auth.currentUser();
    if (!user) {
      this.error.set('You must be logged in.');
      return;
    }
    this.library.createEntry(this.selectedGameId, this.selectedPlatformId, user.id);
    this.router.navigate(['/library/search']);
  }

  cancel(): void {
    this.router.navigate(['/library/search']);
  }
}
