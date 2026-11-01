import { OperationError } from '../models/operation-error.model';

export const MOCK_ERRORS: OperationError[] = [
  {
    id: 'err1',
    timestamp: new Date('2026-05-10T14:30:00'),
    resourceId: 'e1',
    operation: 'Mark as beaten',
    cause: 'Entry is not in PLAYING state.',
  },
  {
    id: 'err2',
    timestamp: new Date('2026-05-12T09:15:00'),
    resourceId: 'e2',
    operation: 'Mark as platinum',
    cause: 'Playtime must be at least 60 h.',
  },
];
