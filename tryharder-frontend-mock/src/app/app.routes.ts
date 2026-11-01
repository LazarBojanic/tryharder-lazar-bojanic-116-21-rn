import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login';
import { AdminComponent } from './features/admin/admin';
import { GameLibrarySearchComponent } from './features/game-library/search/search';
import { GameLibraryCreateComponent } from './features/game-library/create/create';
import { OperationErrorsComponent } from './features/operation-errors/errors';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'library/search', component: GameLibrarySearchComponent, canActivate: [authGuard] },
  { path: 'library/create', component: GameLibraryCreateComponent, canActivate: [authGuard] },
  { path: 'errors', component: OperationErrorsComponent, canActivate: [authGuard] },
  { path: 'dashboard', redirectTo: 'library/search', pathMatch: 'full' },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
