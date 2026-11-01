import { Injectable, signal } from '@angular/core';
import { OperationError } from '../models/operation-error.model';
import { MOCK_ERRORS } from '../mock-data/mock-errors';

@Injectable({ providedIn: 'root' })
export class OperationErrorService {
  private _errors = signal<OperationError[]>(MOCK_ERRORS);

  get errors() {
    return this._errors.asReadonly();
  }

  getErrorsFor(
    userId: string | null,
    isAdmin: boolean,
    entryUserMap: Map<string, string>,
  ): OperationError[] {
    return this._errors().filter((err) => {
      if (isAdmin) return true;
      return entryUserMap.get(err.resourceId) === userId;
    });
  }
}
