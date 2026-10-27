import type { Category, Garment, Look, Outfit, Product, Slot } from './types';

export const SLOTS: Slot[] = ['outer', 'top', 'bottom', 'shoes'];
export const SLOT_LABEL: Record<Slot, string> = { outer: '아우터', top: '상의', bottom: '하의', shoes: '신발' };

export const isSlot = (c: Category): c is Slot => (SLOTS as string[]).includes(c);

/** 피팅룸·내 옷장의 옷 종류 8개 */
export const CLOSET_CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'outer', label: '아우터' },
  { value: 'top', label: '상의' },
  { value: 'bottom', label: '하의' },
  { value: 'shoes', label: '신발' },
  { value: 'bag', label: '가방' },
  { value: 'hat', label: '모자' },
  { value: 'acc', label: '액세서리' },
];

export type Worn = Outfit['slots'];
export type WornRef = NonNullable<Worn[Slot]>;

/** 입은 옷 하나: 내 옷이거나, 아직 없는 쇼핑몰 상품 */
export type WornItem = { slot: Slot; kind: 'garment'; garment: Garment } | { slot: Slot; kind: 'product'; product: Product };

export function productIndex(looks: Look[]): Map<string, Product> {
  return new Map(looks.flatMap((l) => l.items.map((p) => [p.id, p] as const)));
}

export function resolveWorn(worn: Worn, garments: Garment[], products: Map<string, Product>): WornItem[] {
  return SLOTS.flatMap((slot): WornItem[] => {
    const ref = worn[slot];
    if (ref?.garmentId) {
      const garment = garments.find((g) => g.id === ref.garmentId);
      return garment ? [{ slot, kind: 'garment', garment }] : [];
    }
    if (ref?.productId) {
      const product = products.get(ref.productId);
      return product ? [{ slot, kind: 'product', product }] : [];
    }
    return [];
  });
}

export const itemName = (i: WornItem) => (i.kind === 'garment' ? i.garment.alias : i.product.alias);

/** 받침에 따라 이/가 */
export function iga(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const has = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${has ? '이' : '가'}`;
}
