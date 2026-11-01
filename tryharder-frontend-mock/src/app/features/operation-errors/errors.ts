import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { OperationErrorService } from '../../services/operation-error.service';
import { GameLibraryService } from '../../services/game-library.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-operation-errors',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatChipsModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-bold text-gray-800">Operation Error History</h2>
        <p class="text-sm text-gray-500">Audit trail of failed scheduled and background operations</p>
      </div>

      <mat-card>
        <mat-card-content class="!p-0">
          <table mat-table [dataSource]="errors()" class="w-full">
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let err" class="font-mono text-xs text-gray-700">
                {{ err.timestamp | date: 'medium' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="resourceId">
              <th mat-header-cell *matHeaderCellDef>Game Entry</th>
              <td mat-cell *matCellDef="let err" class="font-medium text-gray-900">
                {{ entryTitle(err.resourceId) }}
              </td>
            </ng-container>

            <ng-container matColumnDef="operation">
              <th mat-header-cell *matHeaderCellDef>Operation</th>
              <td mat-cell *matCellDef="let err">
                <mat-chip-set>
                  <mat-chip highlighted>
                    {{ err.operation }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="cause">
              <th mat-header-cell *matHeaderCellDef>Cause</th>
              <td mat-cell *matCellDef="let err" class="text-gray-600">
                {{ err.cause }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell px-4 py-8 text-center text-gray-500" colspan="4">
                No errors recorded.
              </td>
            </tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class OperationErrorsComponent {
  private errorService = inject(OperationErrorService);
  private library = inject(GameLibraryService);
  private auth = inject(AuthService);

  readonly displayedColumns: string[] = ['timestamp', 'resourceId', 'operation', 'cause'];

  errors = computed(() => {
    const user = this.auth.currentUser();
    const isAdmin = user?.role === 'ADMIN';
    return this.errorService.getErrorsFor(user?.id ?? null, isAdmin, this.buildEntryUserMap());
  });

  private buildEntryUserMap(): Map<string, string> {
    const map = new Map<string, string>();
    this.library.entries().forEach((e) => map.set(e.id, e.userId));
    return map;
  }

  entryTitle(entryId: string): string {
    const entry = this.library.entries().find((e) => e.id === entryId);
    if (!entry) return entryId;
    return this.library.games().find((g) => g.id === entry.gameId)?.title ?? entryId;
  }
}
