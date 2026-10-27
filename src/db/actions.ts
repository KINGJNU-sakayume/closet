import type { Worn } from '../domain/catalog';
import type { MatchOverride, Outfit } from '../domain/types';
import { db } from './db';
import { WORN } from './seed';

// 화면에서 저장소를 바꾸는 동작을 한곳에 모은다.

export const setWorn = (worn: Worn) => db.meta.put({ key: WORN, value: JSON.stringify(worn) });

export async function addToShopping(productIds: string[]) {
  const now = new Date().toISOString();
  await db.shopping.bulkPut(productIds.map((productId) => ({ productId, addedAt: now, status: 'wanted' as const })));
}

export const putOverride = (o: MatchOverride) => db.overrides.put(o);
export const deleteOverride = (lookId: string, productId: string) => db.overrides.delete([lookId, productId]);

export async function saveOutfit(title: string, slots: Worn): Promise<Outfit> {
  const outfit: Outfit = { id: `o_${crypto.randomUUID().slice(0, 8)}`, title, slots, createdAt: new Date().toISOString() };
  await db.outfits.add(outfit);
  return outfit;
}
