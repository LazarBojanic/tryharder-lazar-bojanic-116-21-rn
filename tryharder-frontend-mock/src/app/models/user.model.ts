
import type { Permission } from './permission.model';

export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  userId: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
