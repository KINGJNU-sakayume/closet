import seed from '../data/seed.json';
import type { Garment, Outfit, ShoppingItem } from './types';
import type { Worn } from './catalog';

// reference/seed-data.json의 옷·코디·쇼핑 리스트. 룩은 public/looks/에 있다.
// 예시 옷 사진은 경로만 들고 있고, IndexedDB에 넣을 때 Blob으로 바꾼다.
export interface SeedGarment extends Omit<Garment, 'cutout' | 'original' | 'createdAt'> {
  image: string | null;
}

const createdAt = '2026-10-01T00:00:00.000Z';

export const seedGarments = seed.garments as SeedGarment[];
export const seedOutfits: Outfit[] = (seed.outfits as Omit<Outfit, 'createdAt'>[]).map((o) => ({ ...o, createdAt }));
export const seedShopping = seed.shoppingList as ShoppingItem[];
/** 첫 실행 때 아바타가 입고 있는 옷(시안 d4a) */
export const seedWorn = seed.worn as Worn;

export function seedGarmentsWithoutImages(): Garment[] {
  return seedGarments.map(({ image: _image, ...g }) => ({ ...g, createdAt }));
}
