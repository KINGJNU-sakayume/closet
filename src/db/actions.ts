import type { Worn } from '../domain/catalog';
import { garmentFromProduct } from '../domain/shopping';
import type { MatchOverride, Outfit, Product } from '../domain/types';
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

/** '샀어요': 상품 속성으로 내 옷을 만들고 쇼핑 리스트에서 bought로 바꾼다. 되돌리기용으로 만든 옷 id를 돌려준다. */
export async function markBought(product: Product): Promise<string> {
  const garment = garmentFromProduct(product);
  await db.transaction('rw', db.garments, db.shopping, async () => {
    await db.garments.add(garment);
    await db.shopping.update(product.id, { status: 'bought' });
  });
  return garment.id;
}

export async function undoBought(productId: string, garmentId: string) {
  await db.transaction('rw', db.garments, db.shopping, async () => {
    await db.garments.delete(garmentId);
    await db.shopping.update(productId, { status: 'wanted' });
  });
}

/** 빼기: 목록에서만 사라진다 */
export const removeFromShopping = (productId: string) => db.shopping.update(productId, { status: 'removed' });
