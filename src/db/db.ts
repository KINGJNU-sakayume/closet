import Dexie, { type EntityTable } from 'dexie';
import type { Garment, MatchOverride, Outfit, ShoppingItem } from '../domain/types';

interface Meta {
  key: string;
  value: string;
}

// 브라우저 안 저장소. 룩은 정적 JSON이라 여기에 넣지 않는다.
export class ClosetDB extends Dexie {
  garments!: EntityTable<Garment, 'id'>;
  outfits!: EntityTable<Outfit, 'id'>;
  shopping!: EntityTable<ShoppingItem, 'productId'>;
  overrides!: Dexie.Table<MatchOverride, [string, string]>;
  meta!: EntityTable<Meta, 'key'>;

  constructor(name = 'closet-look') {
    super(name);
    this.version(1).stores({
      garments: 'id, attrs.category, createdAt, fromProductId',
      outfits: 'id, createdAt',
      shopping: 'productId, status, addedAt',
      overrides: '[lookId+productId], lookId',
      meta: 'key',
    });
  }
}

export const db = new ClosetDB();
