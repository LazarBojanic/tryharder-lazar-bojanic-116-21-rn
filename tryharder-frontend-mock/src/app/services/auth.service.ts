import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { MOCK_USERS, MOCK_AUTH_USERS } from '../mock-data/mock-users';
import {Permission} from '../models/permission.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  async login(email: string, password: string): Promise<boolean> {
    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) {
      return false;
    }

    const auth = MOCK_AUTH_USERS.find((a) => a.userId === user.id);
    if (auth && (await bcrypt.compare(password, auth.passwordHash))) {
      this._currentUser.set({ ...user });
      return true;
    }

    return false;
  }
  logout(): void {
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  hasPermission(permission: Permission): boolean {
    return this._currentUser()?.permissions.includes(permission) ?? false;
  }
}
