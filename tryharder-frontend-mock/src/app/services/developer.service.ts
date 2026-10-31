import { Injectable, signal } from '@angular/core';
import { Developer } from '../models/developer.model';
import { MOCK_DEVELOPERS } from '../mock-data/mock-developers';

@Injectable({ providedIn: 'root' })
export class DeveloperService {
  private _developers = signal<Developer[]>(MOCK_DEVELOPERS);

  get developers() {
    return this._developers.asReadonly();
  }

  getDeveloperByName(name: string): Developer | undefined {
    return this._developers().find((d) => d.name.toLowerCase() === name.toLowerCase());
  }

  getDeveloperById(id: string): Developer | undefined {
    return this._developers().find((d) => d.id === id);
  }

  addDeveloper(developer: Omit<Developer, 'id'>): Developer {
    const newDeveloper: Developer = {
      ...developer,
      id: crypto.randomUUID(),
    };
    this._developers.update((devs) => [...devs, newDeveloper]);
    return newDeveloper;
  }

  updateDeveloper(id: string, patch: Partial<Developer>): void {
    this._developers.update((devs) =>
      devs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  }

  deleteDeveloper(id: string): void {
    this._developers.update((devs) => devs.filter((d) => d.id !== id));
  }
}
