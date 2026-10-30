
export type GameStatus =
  | 'WISHLIST'
  | 'BACKLOG'
  | 'PLAYING'
  | 'BEATEN'
  | 'PLATINUM'
  | 'SHELVED'
  | 'ABANDONED';

export const allGameStatuses: GameStatus[] = [
  'WISHLIST',
  'BACKLOG',
  'PLAYING',
  'BEATEN',
  'PLATINUM',
  'SHELVED',
  'ABANDONED',
];

export interface GameLibraryEntry {
  id: string;
  userId: string;
  gameId: string;
  platformId: string;
  status: GameStatus;
  playtimeMinutes: number;
  rating: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
