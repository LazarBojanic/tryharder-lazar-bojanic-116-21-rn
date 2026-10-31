import type { User } from '../models/user.model';
import { ALL_PERMISSIONS, GAME_ENTRY_PERMISSIONS } from '../models/permission.model';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@tryharder.com',
    password: 'admin123',
    role: 'ADMIN',
    permissions: [...ALL_PERMISSIONS],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  {
    id: 'u2',
    firstName: 'John',
    lastName: 'Gamer',
    email: 'john@tryharder.com',
    password: 'gamer123',
    role: 'USER',
    permissions: [...GAME_ENTRY_PERMISSIONS],
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: 'u3',
    firstName: 'Jane',
    lastName: 'Player',
    email: 'jane@tryharder.com',
    password: 'player123',
    role: 'USER',
    permissions: [
      'GAME_ENTRY_CREATE',
      'GAME_ENTRY_READ',
      'GAME_ENTRY_UPDATE',
      'GAME_ENTRY_DELETE',
    ],
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
  },
];
