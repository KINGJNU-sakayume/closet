import { completesCount, outfitProductIds } from './closet';
import type { LookResult } from './matching';
import type { Garment, Outfit, Product, ShoppingItem } from './types';

export type ShoppingSort = 'unlock' | 'recent';

export interface Unlock {
  kind: '룩' | '내 코디';
  title: string;
  href: string;
}

export interface ShoppingRow {
  item: ShoppingItem;
  product: Product;
  /** 사면 완성되는 코디 수(룩 + 내 코디) */
  count: number;
  unlocks: Unlock[];
}

/** 이 상품을 사면 완성되는 룩·코디. 저장하지 않고 매번 계산한다. */
export function unlocksOf(productId: string, results: LookResult[], outfits: Outfit[]): Unlock[] {
  const looks = results
    .filter((r) => r.missing.length === 1 && r.missing[0].id === productId)
    .map((r): Unlock => ({ kind: '룩', title: r.look.title, href: `/fitting/${r.look.id}` }));
  const outs = outfits
    .filter((o) => {
      const ids = outfitProductIds(o);
      return ids.length > 0 && ids.every((id) => id === productId);
    })
    .map((o): Unlock => ({ kind: '내 코디', title: o.title, href: `/fitting?outfit=${o.id}` }));
  return [...looks, ...outs];
}

/**
 * @param kept 이미 계산해 둔 행(예: 방금 '샀어요'를 눌러 내 옷이 된 상품). 다시 계산하지 않고 그대로 함께 정렬한다.
 */
export function shoppingRows(
  items: ShoppingItem[],
  products: Map<string, Product>,
  results: LookResult[],
  outfits: Outfit[],
  sort: ShoppingSort,
  kept: ShoppingRow[] = [],
): ShoppingRow[] {
  const rows = items.flatMap((item): ShoppingRow[] => {
    const product = products.get(item.productId);
    if (!product) return [];
    return [{ item, product, count: completesCount(item.productId, results, outfits), unlocks: unlocksOf(item.productId, results, outfits) }];
  });
  rows.push(...kept);
  // 완성 많은 순: 같으면 먼저 담은 것부터. 최근 담은 순: 늦게 담은 것부터
  const byAdded = (a: ShoppingRow, b: ShoppingRow) => a.item.addedAt.localeCompare(b.item.addedAt);
  return rows.sort(sort === 'unlock' ? (a, b) => b.count - a.count || byAdded(a, b) : (a, b) => byAdded(b, a));
}

/** '샀어요': 상품의 속성으로 내 옷을 만든다. 사진은 나중에 사용자가 올린다. */
export function garmentFromProduct(product: Product, now = new Date()): Garment {
  return {
    id: `g_${product.id}_${now.getTime().toString(36)}`,
    alias: product.alias,
    sourceTitle: product.title,
    ...(product.url ? { sourceUrl: product.url } : {}),
    colorHex: product.colorHex,
    attrs: product.attrs,
    fromProductId: product.id,
    createdAt: now.toISOString(),
  };
}

/** 코디 안에서 아직 없는 쇼핑몰 상품(산 상품은 내 옷으로 본다) */
export function outfitShopProducts(outfit: Outfit, garments: Garment[]): string[] {
  const owned = new Set(garments.flatMap((g) => (g.fromProductId ? [g.fromProductId] : [])));
  return outfitProductIds(outfit).filter((id) => !owned.has(id));
}

/** 가격을 모두 알 때만 합계를 낸다. 모르는 가격은 지어내지 않는다. */
export function totalPrice(products: Product[]): number | undefined {
  if (products.length === 0 || products.some((p) => typeof p.price !== 'number')) return undefined;
  return products.reduce((sum, p) => sum + (p.price as number), 0);
}
