import { Injectable, signal } from '@angular/core';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../mock-data/mock-users';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _users = signal<User[]>([]);

  constructor() {
    this._users.set(MOCK_USERS);
  }

  get users() {
    return this._users.asReadonly();
  }

  addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): void {
    const now = new Date();
    const newUser: User = { ...user, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    this._users.update((users) => [...users, newUser]);
  }

  updateUser(id: string, patch: Partial<User>): void {
    this._users.update((users) =>
      users.map((u) => (u.id === id ? { ...u, ...patch, updatedAt: new Date() } : u)),
    );
  }

  deleteUser(id: string): void {
    this._users.update((users) => users.filter((u) => u.id !== id));
  }
}
