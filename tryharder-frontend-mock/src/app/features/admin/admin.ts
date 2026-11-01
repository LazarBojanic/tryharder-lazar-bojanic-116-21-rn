import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { GameLibraryService } from '../../services/game-library.service';
import { DeveloperService } from '../../services/developer.service';
import { GenreService } from '../../services/genre.service';
import { User, UserRole } from '../../models/user.model';
import { Game } from '../../models/game.model';
import { GameLibraryEntry, allGameStatuses } from '../../models/game-entry.model';
import { Platform } from '../../models/platform.model';
import { Developer } from '../../models/developer.model';
import { Genre } from '../../models/genre.model';
import {
  Permission,
  USER_PERMISSIONS,
  GAME_ENTRY_PERMISSIONS,
} from '../../models/permission.model';

export type AdminTab = 'users' | 'entries' | 'games' | 'developers' | 'platforms' | 'genres';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold text-gray-800">
          Admin Panel – {{ currentTabLabel() }}
        </h2>
        <p class="text-sm text-gray-500">Manage system users, game entries, games catalog, developers, platforms, and genres.</p>
      </div>

      @if (!auth.hasPermission(USER_PERMISSIONS[1])) {
        <div class="rounded bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-200">
          You do not have permission to view this page.
        </div>
      } @else {
        <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
          <button
            type="button"
            (click)="selectTab('users')"
            [class]="activeTab() === 'users' ? activeTabClass : inactiveTabClass"
          >
            Users
          </button>
          <button
            type="button"
            (click)="selectTab('entries')"
            [class]="activeTab() === 'entries' ? activeTabClass : inactiveTabClass"
          >
            Game Entries
          </button>
          <button
            type="button"
            (click)="selectTab('games')"
            [class]="activeTab() === 'games' ? activeTabClass : inactiveTabClass"
          >
            Games
          </button>
          <button
            type="button"
            (click)="selectTab('developers')"
            [class]="activeTab() === 'developers' ? activeTabClass : inactiveTabClass"
          >
            Developers
          </button>
          <button
            type="button"
            (click)="selectTab('platforms')"
            [class]="activeTab() === 'platforms' ? activeTabClass : inactiveTabClass"
          >
            Platforms
          </button>
          <button
            type="button"
            (click)="selectTab('genres')"
            [class]="activeTab() === 'genres' ? activeTabClass : inactiveTabClass"
          >
            Genres
          </button>
        </div>

        @if (activeTab() === 'users') {
          <div class="flex flex-col gap-4">
            @if (auth.hasPermission(USER_PERMISSIONS[0])) {
              <div>
                <button
                  mat-flat-button
                  color="primary"
                  (click)="showUserForm.set(!showUserForm())"
                >
                  <mat-icon>person_add</mat-icon>
                  <span>Add User</span>
                </button>
              </div>
            }

            @if (showUserForm()) {
              <mat-card>
                <mat-card-header class="mb-3">
                  <mat-card-title class="text-lg!">
                    {{ editingUser() ? 'Edit User' : 'Add User' }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form (ngSubmit)="saveUser()" class="flex flex-col gap-3">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>First name</mat-label>
                        <input
                          matInput
                          [(ngModel)]="userForm.firstName"
                          name="firstName"
                          required
                        />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Last name</mat-label>
                        <input
                          matInput
                          [(ngModel)]="userForm.lastName"
                          name="lastName"
                          required
                        />
                      </mat-form-field>
                    </div>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Email</mat-label>
                        <input
                          matInput
                          [(ngModel)]="userForm.email"
                          name="email"
                          type="email"
                          required
                        />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Role</mat-label>
                        <mat-select [(ngModel)]="userForm.role" name="role">
                          <mat-option value="USER">USER</mat-option>
                          <mat-option value="ADMIN">ADMIN</mat-option>
                        </mat-select>
                      </mat-form-field>
                    </div>

                    <div class="rounded border border-gray-200 p-3">
                      <div class="text-xs font-semibold text-gray-500 mb-2">PERMISSIONS</div>
                      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        @for (perm of allPermissions; track perm) {
                          <mat-checkbox
                            [checked]="userForm.permissions.includes(perm)"
                            (change)="togglePermission(perm)"
                          >
                            {{ perm }}
                          </mat-checkbox>
                        }
                      </div>
                    </div>

                    @if (userFormError()) {
                      <div class="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {{ userFormError() }}
                      </div>
                    }

                    <div class="flex items-center gap-3 pt-1">
                      <button mat-flat-button color="primary" type="submit">
                        <mat-icon>check</mat-icon>
                        <span>Save</span>
                      </button>
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="cancelUserForm()"
                      >
                        <mat-icon>close</mat-icon>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <mat-card>
              <mat-card-content class="!p-0">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-gray-700">
                    <thead class="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                      <tr>
                        <th class="px-4 py-3">First name</th>
                        <th class="px-4 py-3">Last name</th>
                        <th class="px-4 py-3">Email</th>
                        <th class="px-4 py-3">Role</th>
                        <th class="px-4 py-3">Permissions</th>
                        <th class="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (user of userService.users(); track user.id) {
                        <tr class="hover:bg-gray-50/50">
                          <td class="px-4 py-3 font-medium text-gray-900">{{ user.firstName }}</td>
                          <td class="px-4 py-3 font-medium text-gray-900">{{ user.lastName }}</td>
                          <td class="px-4 py-3">{{ user.email }}</td>
                          <td class="px-4 py-3">
                            <mat-chip-set>
                              <mat-chip [highlighted]="user.role === 'ADMIN'">
                                {{ user.role }}
                              </mat-chip>
                            </mat-chip-set>
                          </td>
                          <td class="px-4 py-3">
                            <div class="flex flex-wrap gap-1 max-w-xs">
                              @for (p of user.permissions; track p) {
                                <span class="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">{{ p }}</span>
                              }
                            </div>
                          </td>
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                              @if (auth.hasPermission(USER_PERMISSIONS[2])) {
                                <button
                                  mat-stroked-button
                                  (click)="editUser(user)"
                                  class="text-amber-700!"
                                >
                                  <mat-icon>edit</mat-icon>
                                  <span>Edit</span>
                                </button>
                              }
                              @if (auth.hasPermission(USER_PERMISSIONS[3])) {
                                <button
                                  mat-stroked-button
                                  (click)="deleteUser(user.id)"
                                  class="text-red-700!"
                                >
                                  <mat-icon>delete</mat-icon>
                                  <span>Delete</span>
                                </button>
                              }
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }

        @if (activeTab() === 'entries') {
          <div class="flex flex-col gap-4">
            <mat-card>
              <mat-card-content>
                <div class="flex flex-col gap-3">
                  <div class="flex flex-col gap-1">
                    <h3 class="text-lg font-bold text-gray-800">All Game Entries</h3>
                    <p class="text-sm text-gray-500">
                      Read-only overview of every user's library. Manage your own entries from the Library page.
                    </p>
                  </div>
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Game title</mat-label>
                      <input
                        matInput
                        [ngModel]="entriesTitleFilter()"
                        (ngModelChange)="entriesTitleFilter.set($event)"
                        placeholder="Search all entries"
                      />
                      <mat-icon matSuffix>search</mat-icon>
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Status</mat-label>
                      <mat-select
                        [ngModel]="entriesStatusFilter()"
                        (ngModelChange)="entriesStatusFilter.set($event)"
                      >
                        <mat-option value="ALL">All statuses</mat-option>
                        @for (status of allGameStatuses; track status) {
                          <mat-option [value]="status">{{ status }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card>
              <mat-card-content class="p-0!">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-gray-700">
                    <thead class="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                      <tr>
                        <th class="px-4 py-3">Game</th>
                        <th class="px-4 py-3">Owner</th>
                        <th class="px-4 py-3">Platform</th>
                        <th class="px-4 py-3">Status</th>
                        <th class="px-4 py-3">Rating</th>
                        <th class="px-4 py-3">Playtime</th>
                        <th class="px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (entry of filteredAllEntries(); track entry.id) {
                        <tr class="hover:bg-gray-50/50">
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-3">
                              @if (entryGame(entry)?.coverImageUrl; as cover) {
                                <img
                                  [src]="cover"
                                  [alt]="entryGame(entry)?.title"
                                  class="h-14 w-10 shrink-0 rounded border border-gray-200 bg-white object-contain"
                                />
                              }
                              <span class="font-medium text-gray-900">{{ entryGame(entry)?.title ?? entry.gameId }}</span>
                            </div>
                          </td>
                          <td class="px-4 py-3">
                            <div class="flex flex-col">
                              <span class="font-medium text-gray-800">{{ entryOwnerName(entry) }}</span>
                              <span class="text-xs text-gray-500">{{ entryOwnerEmail(entry) }}</span>
                            </div>
                          </td>
                          <td class="px-4 py-3">{{ entryPlatformName(entry) }}</td>
                          <td class="px-4 py-3">
                            <mat-chip-set>
                              <mat-chip [highlighted]="entry.status === 'PLAYING' || entry.status === 'BEATEN' || entry.status === 'PLATINUM'">
                                {{ entry.status }}
                              </mat-chip>
                            </mat-chip-set>
                          </td>
                          <td class="px-4 py-3">
                            @if (entry.rating) {
                              <span class="font-semibold text-amber-700">{{ entry.rating }}/10</span>
                            } @else {
                              <span class="text-xs text-gray-400">—</span>
                            }
                          </td>
                          <td class="px-4 py-3">{{ formatPlaytime(entry.playtimeMinutes) }}</td>
                          <td class="px-4 py-3">{{ entry.createdAt | date: 'shortDate' }}</td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                            No game entries match the current filters.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }

        @if (activeTab() === 'games') {
          <div class="flex flex-col gap-4">
            <div>
              <button
                mat-flat-button
                color="primary"
                (click)="showGameForm.set(!showGameForm())"
              >
                <mat-icon>add</mat-icon>
                <span>Add Game</span>
              </button>
            </div>

            @if (showGameForm()) {
              <mat-card>
                <mat-card-header class="mb-3">
                  <mat-card-title class="text-lg!">
                    {{ editingGame() ? 'Edit Game' : 'Add Game' }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form (ngSubmit)="saveGame()" class="flex flex-col gap-3">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Title</mat-label>
                        <input
                          matInput
                          [(ngModel)]="gameForm.title"
                          name="title"
                          required
                          placeholder="Game Title"
                        />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Release Year</mat-label>
                        <input
                          matInput
                          [(ngModel)]="gameForm.releaseYear"
                          name="releaseYear"
                          type="number"
                          required
                          placeholder="2026"
                        />
                      </mat-form-field>
                    </div>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Developer</mat-label>
                        <input
                          matInput
                          [(ngModel)]="gameForm.developer"
                          name="developer"
                          required
                          list="developer-options"
                          placeholder="Developer Name"
                        />
                        <datalist id="developer-options">
                          @for (dev of developerService.developers(); track dev.id) {
                            <option [value]="dev.name"></option>
                          }
                        </datalist>
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Genre</mat-label>
                        <input
                          matInput
                          [(ngModel)]="gameForm.genre"
                          name="genre"
                          required
                          list="genre-options"
                          placeholder="e.g. Action RPG, Platformer"
                        />
                        <datalist id="genre-options">
                          @for (gen of genreService.genres(); track gen.id) {
                            <option [value]="gen.name"></option>
                          }
                        </datalist>
                      </mat-form-field>
                    </div>

                    @if (gameFormError()) {
                      <div class="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {{ gameFormError() }}
                      </div>
                    }

                    <div class="flex items-center gap-3 pt-1">
                      <button mat-flat-button color="primary" type="submit">
                        <mat-icon>check</mat-icon>
                        <span>Save</span>
                      </button>
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="cancelGameForm()"
                      >
                        <mat-icon>close</mat-icon>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <mat-card>
              <mat-card-content class="p-0!">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-gray-700">
                    <thead class="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                      <tr>
                        <th class="px-4 py-3">Title</th>
                        <th class="px-4 py-3">Release Year</th>
                        <th class="px-4 py-3">Developer</th>
                        <th class="px-4 py-3">Genre</th>
                        <th class="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (game of gameLibrary.games(); track game.id) {
                        <tr class="hover:bg-gray-50/50">
                          <td class="px-4 py-3 font-medium text-gray-900">{{ game.title }}</td>
                          <td class="px-4 py-3">{{ game.releaseYear }}</td>
                          <td class="px-4 py-3">{{ game.developer }}</td>
                          <td class="px-4 py-3">
                            <mat-chip-set>
                              <mat-chip>{{ game.genre }}</mat-chip>
                            </mat-chip-set>
                          </td>
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                              <button
                                mat-stroked-button
                                (click)="editGame(game)"
                                class="text-amber-700!"
                              >
                                <mat-icon>edit</mat-icon>
                                <span>Edit</span>
                              </button>
                              <button
                                mat-stroked-button
                                (click)="deleteGame(game.id)"
                                class="text-red-700!"
                              >
                                <mat-icon>delete</mat-icon>
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }

        @if (activeTab() === 'developers') {
          <div class="flex flex-col gap-4">
            <div>
              <button
                mat-flat-button
                color="primary"
                (click)="showDeveloperForm.set(!showDeveloperForm())"
              >
                <mat-icon>add</mat-icon>
                <span>Add Developer</span>
              </button>
            </div>

            @if (showDeveloperForm()) {
              <mat-card>
                <mat-card-header class="mb-3">
                  <mat-card-title class="text-lg!">
                    {{ editingDeveloper() ? 'Edit Developer' : 'Add Developer' }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form (ngSubmit)="saveDeveloper()" class="flex flex-col gap-3">
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Company Name</mat-label>
                        <input
                          matInput
                          [(ngModel)]="developerForm.name"
                          name="name"
                          required
                          placeholder="Developer / Studio Name"
                        />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Country</mat-label>
                        <input
                          matInput
                          [(ngModel)]="developerForm.country"
                          name="country"
                          required
                          placeholder="e.g. Japan, USA"
                        />
                      </mat-form-field>
                    </div>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Founded Year</mat-label>
                        <input
                          matInput
                          [(ngModel)]="developerForm.foundedYear"
                          name="foundedYear"
                          type="number"
                          required
                          placeholder="1999"
                        />
                      </mat-form-field>
                      <mat-form-field appearance="outline" class="w-full">
                        <mat-label>Website</mat-label>
                        <input
                          matInput
                          [(ngModel)]="developerForm.website"
                          name="website"
                          type="url"
                          placeholder="https://..."
                        />
                      </mat-form-field>
                    </div>

                    @if (developerFormError()) {
                      <div class="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {{ developerFormError() }}
                      </div>
                    }

                    <div class="flex items-center gap-3 pt-1">
                      <button mat-flat-button color="primary" type="submit">
                        <mat-icon>check</mat-icon>
                        <span>Save</span>
                      </button>
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="cancelDeveloperForm()"
                      >
                        <mat-icon>close</mat-icon>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <mat-card>
              <mat-card-content class="p-0!">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-gray-700">
                    <thead class="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                      <tr>
                        <th class="px-4 py-3">Name</th>
                        <th class="px-4 py-3">Country</th>
                        <th class="px-4 py-3">Founded</th>
                        <th class="px-4 py-3">Website</th>
                        <th class="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (dev of developerService.developers(); track dev.id) {
                        <tr class="hover:bg-gray-50/50">
                          <td class="px-4 py-3 font-medium text-gray-900">{{ dev.name }}</td>
                          <td class="px-4 py-3">{{ dev.country }}</td>
                          <td class="px-4 py-3">{{ dev.foundedYear }}</td>
                          <td class="px-4 py-3">
                            @if (dev.website) {
                              <a
                                [href]="dev.website"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                <span>{{ dev.website }}</span>
                                <mat-icon class="text-xs! h-3! w-3!">open_in_new</mat-icon>
                              </a>
                            } @else {
                              <span class="text-gray-400">—</span>
                            }
                          </td>
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                              <button
                                mat-stroked-button
                                (click)="editDeveloper(dev)"
                                class="text-amber-700!"
                              >
                                <mat-icon>edit</mat-icon>
                                <span>Edit</span>
                              </button>
                              <button
                                mat-stroked-button
                                (click)="deleteDeveloper(dev.id)"
                                class="text-red-700!"
                              >
                                <mat-icon>delete</mat-icon>
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }

        @if (activeTab() === 'platforms') {
          <div class="flex flex-col gap-4">
            <div>
              <button
                mat-flat-button
                color="primary"
                (click)="showPlatformForm.set(!showPlatformForm())"
              >
                <mat-icon>add</mat-icon>
                <span>Add Platform</span>
              </button>
            </div>

            @if (showPlatformForm()) {
              <mat-card>
                <mat-card-header class="mb-3">
                  <mat-card-title class="text-lg!">
                    {{ editingPlatform() ? 'Edit Platform' : 'Add Platform' }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form (ngSubmit)="savePlatform()" class="flex flex-col gap-3">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Platform Name</mat-label>
                      <input
                        matInput
                        [(ngModel)]="platformForm.name"
                        name="name"
                        required
                        placeholder="e.g. Nintendo Switch, PlayStation 5, PC"
                      />
                    </mat-form-field>

                    @if (platformFormError()) {
                      <div class="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {{ platformFormError() }}
                      </div>
                    }

                    <div class="flex items-center gap-3 pt-1">
                      <button mat-flat-button color="primary" type="submit">
                        <mat-icon>check</mat-icon>
                        <span>Save</span>
                      </button>
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="cancelPlatformForm()"
                      >
                        <mat-icon>close</mat-icon>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <mat-card>
              <mat-card-content class="p-0!">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-gray-700">
                    <thead class="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                      <tr>
                        <th class="px-4 py-3">Platform Name</th>
                        <th class="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (platform of gameLibrary.platforms(); track platform.id) {
                        <tr class="hover:bg-gray-50/50">
                          <td class="px-4 py-3 font-medium text-gray-900">{{ platform.name }}</td>
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                              <button
                                mat-stroked-button
                                (click)="editPlatform(platform)"
                                class="text-amber-700!"
                              >
                                <mat-icon>edit</mat-icon>
                                <span>Edit</span>
                              </button>
                              <button
                                mat-stroked-button
                                (click)="deletePlatform(platform.id)"
                                class="text-red-700!"
                              >
                                <mat-icon>delete</mat-icon>
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }

        @if (activeTab() === 'genres') {
          <div class="flex flex-col gap-4">
            <div>
              <button
                mat-flat-button
                color="primary"
                (click)="showGenreForm.set(!showGenreForm())"
              >
                <mat-icon>add</mat-icon>
                <span>Add Genre</span>
              </button>
            </div>

            @if (showGenreForm()) {
              <mat-card>
                <mat-card-header class="mb-3">
                  <mat-card-title class="text-lg!">
                    {{ editingGenre() ? 'Edit Genre' : 'Add Genre' }}
                  </mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <form (ngSubmit)="saveGenre()" class="flex flex-col gap-3">
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Genre Name</mat-label>
                      <input
                        matInput
                        [(ngModel)]="genreForm.name"
                        name="name"
                        required
                        placeholder="e.g. Action RPG, Roguelike, Metroidvania"
                      />
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="w-full">
                      <mat-label>Description</mat-label>
                      <textarea
                        matInput
                        [(ngModel)]="genreForm.description"
                        name="description"
                        rows="3"
                        placeholder="Brief description of the genre"
                      ></textarea>
                    </mat-form-field>

                    @if (genreFormError()) {
                      <div class="rounded bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                        {{ genreFormError() }}
                      </div>
                    }

                    <div class="flex items-center gap-3 pt-1">
                      <button mat-flat-button color="primary" type="submit">
                        <mat-icon>check</mat-icon>
                        <span>Save</span>
                      </button>
                      <button
                        mat-stroked-button
                        type="button"
                        (click)="cancelGenreForm()"
                      >
                        <mat-icon>close</mat-icon>
                        <span>Cancel</span>
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            }

            <mat-card>
              <mat-card-content class="p-0!">
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-gray-700">
                    <thead class="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                      <tr>
                        <th class="px-4 py-3">Name</th>
                        <th class="px-4 py-3">Description</th>
                        <th class="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      @for (genre of genreService.genres(); track genre.id) {
                        <tr class="hover:bg-gray-50/50">
                          <td class="px-4 py-3 font-medium text-gray-900">{{ genre.name }}</td>
                          <td class="px-4 py-3 text-gray-600">{{ genre.description || '—' }}</td>
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                              <button
                                mat-stroked-button
                                (click)="editGenre(genre)"
                                class="text-amber-700!"
                              >
                                <mat-icon>edit</mat-icon>
                                <span>Edit</span>
                              </button>
                              <button
                                mat-stroked-button
                                (click)="deleteGenre(genre.id)"
                                class="text-red-700!"
                              >
                                <mat-icon>delete</mat-icon>
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        }
      }
    </div>
  `,
})
export class AdminComponent {
  readonly userService = inject(UserService);
  readonly auth = inject(AuthService);
  readonly gameLibrary = inject(GameLibraryService);
  readonly developerService = inject(DeveloperService);
  readonly genreService = inject(GenreService);

  readonly activeTabClass = 'rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm';
  readonly inactiveTabClass = 'rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200';

  readonly activeTab = signal<AdminTab>('users');
  readonly allGameStatuses = allGameStatuses;
  readonly entriesTitleFilter = signal('');
  readonly entriesStatusFilter = signal<string>('ALL');

  readonly filteredAllEntries = computed(() => {
    const user = this.auth.currentUser();
    const isAdmin = user?.role === 'ADMIN';
    const status = this.entriesStatusFilter();
    return this.gameLibrary.search(
      {
        title: this.entriesTitleFilter() || undefined,
        statuses: status === 'ALL' ? undefined : [status],
      },
      user?.id ?? null,
      isAdmin,
      'ALL',
    );
  });

  readonly currentTabLabel = computed(() => {
    switch (this.activeTab()) {
      case 'users':
        return 'User Management';
      case 'entries':
        return 'Game Entry Management';
      case 'games':
        return 'Game Management';
      case 'developers':
        return 'Developer Management';
      case 'platforms':
        return 'Platform Management';
      case 'genres':
        return 'Genre Management';
    }
  });

  selectTab(tab: AdminTab): void {
    this.activeTab.set(tab);
  }

  readonly showUserForm = signal(false);
  readonly editingUser = signal<User | null>(null);
  readonly userFormError = signal('');
  readonly allPermissions: Permission[] = [...USER_PERMISSIONS, ...GAME_ENTRY_PERMISSIONS] as Permission[];

  userForm: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
  } = this.emptyUserForm();

  private emptyUserForm() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      role: 'USER' as UserRole,
      permissions: [] as Permission[],
    };
  }

  togglePermission(perm: Permission): void {
    const idx = this.userForm.permissions.indexOf(perm);
    if (idx >= 0) this.userForm.permissions.splice(idx, 1);
    else this.userForm.permissions.push(perm);
  }

  saveUser(): void {
    this.userFormError.set('');
    if (!this.userForm.firstName || !this.userForm.lastName || !this.userForm.email) {
      this.userFormError.set('First name, last name and email are required.');
      return;
    }
    if (this.editingUser()) {
      this.userService.updateUser(this.editingUser()!.id, { ...this.userForm });
    } else {
      this.userService.addUser({ ...this.userForm, permissions: [...this.userForm.permissions] });
    }
    this.cancelUserForm();
  }

  editUser(user: User): void {
    this.editingUser.set(user);
    this.userForm = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      permissions: [...user.permissions] as Permission[],
    };
    this.showUserForm.set(true);
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id);
    }
  }

  cancelUserForm(): void {
    this.showUserForm.set(false);
    this.editingUser.set(null);
    this.userForm = this.emptyUserForm();
    this.userFormError.set('');
  }

  cancelForm(): void {
    this.cancelUserForm();
  }

  readonly showGameForm = signal(false);
  readonly editingGame = signal<Game | null>(null);
  readonly gameFormError = signal('');

  gameForm: {
    title: string;
    releaseYear: number;
    developer: string;
    genre: string;
    coverImageUrl?: string;
  } = this.emptyGameForm();

  private emptyGameForm() {
    return {
      title: '',
      releaseYear: new Date().getFullYear(),
      developer: '',
      genre: '',
      coverImageUrl: '',
    };
  }

  saveGame(): void {
    this.gameFormError.set('');
    if (!this.gameForm.title || !this.gameForm.developer || !this.gameForm.genre || !this.gameForm.releaseYear) {
      this.gameFormError.set('All game fields (title, release year, developer, genre) are required.');
      return;
    }
    const payload = {
      title: this.gameForm.title,
      releaseYear: this.gameForm.releaseYear,
      developer: this.gameForm.developer,
      genre: this.gameForm.genre,
      ...(this.gameForm.coverImageUrl ? { coverImageUrl: this.gameForm.coverImageUrl } : {}),
    };
    if (this.editingGame()) {
      this.gameLibrary.updateGame(this.editingGame()!.id, payload);
    } else {
      this.gameLibrary.addGame(payload);
    }
    this.cancelGameForm();
  }

  editGame(game: Game): void {
    this.editingGame.set(game);
    this.gameForm = {
      title: game.title,
      releaseYear: game.releaseYear,
      developer: game.developer,
      genre: game.genre,
      coverImageUrl: game.coverImageUrl || '',
    };
    this.showGameForm.set(true);
  }

  deleteGame(id: string): void {
    if (confirm('Are you sure you want to delete this game?')) {
      this.gameLibrary.deleteGame(id);
    }
  }

  cancelGameForm(): void {
    this.showGameForm.set(false);
    this.editingGame.set(null);
    this.gameForm = this.emptyGameForm();
    this.gameFormError.set('');
  }

  readonly showDeveloperForm = signal(false);
  readonly editingDeveloper = signal<Developer | null>(null);
  readonly developerFormError = signal('');

  developerForm: {
    name: string;
    country: string;
    foundedYear: number;
    website?: string;
    logoUrl?: string;
  } = this.emptyDeveloperForm();

  private emptyDeveloperForm() {
    return {
      name: '',
      country: '',
      foundedYear: 2000,
      website: '',
      logoUrl: '',
    };
  }

  saveDeveloper(): void {
    this.developerFormError.set('');
    if (!this.developerForm.name || !this.developerForm.country || !this.developerForm.foundedYear) {
      this.developerFormError.set('Name, country, and founded year are required.');
      return;
    }
    const payload = {
      name: this.developerForm.name,
      country: this.developerForm.country,
      foundedYear: this.developerForm.foundedYear,
      website: this.developerForm.website || undefined,
      logoUrl: this.developerForm.logoUrl || undefined,
    };
    if (this.editingDeveloper()) {
      this.developerService.updateDeveloper(this.editingDeveloper()!.id, payload);
    } else {
      this.developerService.addDeveloper(payload);
    }
    this.cancelDeveloperForm();
  }

  editDeveloper(dev: Developer): void {
    this.editingDeveloper.set(dev);
    this.developerForm = {
      name: dev.name,
      country: dev.country,
      foundedYear: dev.foundedYear,
      website: dev.website || '',
      logoUrl: dev.logoUrl || '',
    };
    this.showDeveloperForm.set(true);
  }

  deleteDeveloper(id: string): void {
    if (confirm('Are you sure you want to delete this developer?')) {
      this.developerService.deleteDeveloper(id);
    }
  }

  cancelDeveloperForm(): void {
    this.showDeveloperForm.set(false);
    this.editingDeveloper.set(null);
    this.developerForm = this.emptyDeveloperForm();
    this.developerFormError.set('');
  }

  readonly showPlatformForm = signal(false);
  readonly editingPlatform = signal<Platform | null>(null);
  readonly platformFormError = signal('');

  platformForm = {
    name: '',
  };

  private emptyPlatformForm() {
    return {
      name: '',
    };
  }

  savePlatform(): void {
    this.platformFormError.set('');
    if (!this.platformForm.name.trim()) {
      this.platformFormError.set('Platform name is required.');
      return;
    }
    if (this.editingPlatform()) {
      this.gameLibrary.updatePlatform(this.editingPlatform()!.id, { ...this.platformForm });
    } else {
      this.gameLibrary.addPlatform({ ...this.platformForm });
    }
    this.cancelPlatformForm();
  }

  editPlatform(platform: Platform): void {
    this.editingPlatform.set(platform);
    this.platformForm = {
      name: platform.name,
    };
    this.showPlatformForm.set(true);
  }

  deletePlatform(id: string): void {
    if (confirm('Are you sure you want to delete this platform?')) {
      this.gameLibrary.deletePlatform(id);
    }
  }

  cancelPlatformForm(): void {
    this.showPlatformForm.set(false);
    this.editingPlatform.set(null);
    this.platformForm = this.emptyPlatformForm();
    this.platformFormError.set('');
  }

  readonly showGenreForm = signal(false);
  readonly editingGenre = signal<Genre | null>(null);
  readonly genreFormError = signal('');

  genreForm = {
    name: '',
    description: '',
  };

  private emptyGenreForm() {
    return {
      name: '',
      description: '',
    };
  }

  saveGenre(): void {
    this.genreFormError.set('');
    if (!this.genreForm.name.trim()) {
      this.genreFormError.set('Genre name is required.');
      return;
    }
    if (this.editingGenre()) {
      this.genreService.updateGenre(this.editingGenre()!.id, {
        name: this.genreForm.name.trim(),
        description: this.genreForm.description?.trim() || undefined,
      });
    } else {
      this.genreService.addGenre({
        name: this.genreForm.name.trim(),
        description: this.genreForm.description?.trim() || undefined,
      });
    }
    this.cancelGenreForm();
  }

  editGenre(genre: Genre): void {
    this.editingGenre.set(genre);
    this.genreForm = {
      name: genre.name,
      description: genre.description || '',
    };
    this.showGenreForm.set(true);
  }

  deleteGenre(id: string): void {
    if (confirm('Are you sure you want to delete this genre?')) {
      this.genreService.deleteGenre(id);
    }
  }

  cancelGenreForm(): void {
    this.showGenreForm.set(false);
    this.editingGenre.set(null);
    this.genreForm = this.emptyGenreForm();
    this.genreFormError.set('');
  }

  entryGame(entry: GameLibraryEntry): Game | undefined {
    return this.gameLibrary.getGame(entry.gameId);
  }

  entryPlatformName(entry: GameLibraryEntry): string {
    if (!entry.platformId) return '—';
    return this.gameLibrary.getPlatform(entry.platformId)?.name ?? entry.platformId;
  }

  entryOwnerName(entry: GameLibraryEntry): string {
    const owner = this.userService.users().find((user) => user.id === entry.userId);
    return owner ? `${owner.firstName} ${owner.lastName}` : entry.userId;
  }

  entryOwnerEmail(entry: GameLibraryEntry): string {
    return this.userService.users().find((user) => user.id === entry.userId)?.email ?? '—';
  }

  formatPlaytime(minutes: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  }

  protected readonly USER_PERMISSIONS = USER_PERMISSIONS;
}
