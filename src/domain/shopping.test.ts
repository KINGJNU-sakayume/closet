import { describe, expect, it } from 'vitest';
import { productIndex } from './catalog';
import { judgeLook } from './matching';
import { seedGarmentsWithoutImages, seedOutfits, seedShopping } from './seed';
import { garmentFromProduct, outfitShopProducts, shoppingRows, totalPrice } from './shopping';
import { readLooks } from './testData';
import type { ShoppingItem } from './types';

const looks = readLooks();
const products = productIndex(looks);
const garments = seedGarmentsWithoutImages();
const results = looks.map((l) => judgeLook(l, garments));
const withCamo: ShoppingItem[] = [...seedShopping, { productId: 'p_camo', status: 'wanted', addedAt: '2026-10-27T00:00:00.000Z' }];

describe('쇼핑 리스트', () => {
  it('완성 많은 순: 카모 팬츠(2) → 네이비 울 코트(1) → 카키 필드 재킷(1)', () => {
    const rows = shoppingRows(withCamo, products, results, seedOutfits, 'unlock');
    expect(rows.map((r) => [r.product.alias, r.count])).toEqual([
      ['카모 와이드 카고 팬츠', 2],
      ['네이비 울 코트', 1],
      ['카키 필드 재킷', 1],
    ]);
    expect(rows[0].unlocks).toEqual([
      { kind: '룩', title: '카모 카고 스트릿 코디', href: '/fitting/l_camo' },
      { kind: '내 코디', title: '카모 카고 스트릿', href: '/fitting?outfit=o_camo' },
    ]);
  });

  it('방금 산 상품은 계산해 둔 행 그대로 같은 자리에 둔다', () => {
    const before = shoppingRows(withCamo, products, results, seedOutfits, 'unlock');
    const after = [...garments, garmentFromProduct(products.get('p_camo')!)];
    const resultsAfter = looks.map((l) => judgeLook(l, after));
    const rows = shoppingRows(seedShopping, products, resultsAfter, seedOutfits, 'unlock', [before[0]]);
    expect(rows.map((r) => [r.product.id, r.count])).toEqual([
      ['p_camo', 2],
      ['p_navy', 1],
      ['p_khaki', 1],
    ]);
  });

  it('최근 담은 순', () => {
    const rows = shoppingRows(withCamo, products, results, seedOutfits, 'recent');
    expect(rows.map((r) => r.product.id)).toEqual(['p_camo', 'p_khaki', 'p_navy']);
  });

  it('샀어요 → 내 옷이 되면 카모 룩 3/3, 코디는 전부 내 옷', () => {
    const bought = garmentFromProduct(products.get('p_camo')!);
    expect(bought).toMatchObject({ alias: '카모 와이드 카고 팬츠', fromProductId: 'p_camo', attrs: { category: 'bottom' } });
    const after = [...garments, bought];
    const camo = judgeLook(looks.find((l) => l.id === 'l_camo')!, after);
    expect(`${camo.own}/${camo.total}`).toBe('3/3');
    const outfit = seedOutfits.find((o) => o.id === 'o_camo')!;
    expect(outfitShopProducts(outfit, garments)).toEqual(['p_camo']);
    expect(outfitShopProducts(outfit, after)).toEqual([]);
  });

  it('가격을 모르면 합계를 내지 않는다', () => {
    expect(totalPrice([products.get('p_camo')!])).toBeUndefined();
    expect(totalPrice([{ ...products.get('p_camo')!, price: 59000 }, { ...products.get('p_navy')!, price: 129000 }])).toBe(188000);
  });
});
