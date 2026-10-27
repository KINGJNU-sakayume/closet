import { describe, expect, it } from 'vitest';
import { iga, productIndex, resolveWorn } from './catalog';
import { seedGarmentsWithoutImages } from './seed';
import { readLooks } from './testData';

describe('catalog', () => {
  it('입은 옷을 내 옷과 쇼핑몰 상품으로 풀어낸다', () => {
    const items = resolveWorn(
      { outer: { garmentId: 'g_jacket' }, bottom: { productId: 'p_camo' } },
      seedGarmentsWithoutImages(),
      productIndex(readLooks()),
    );
    expect(items.map((i) => [i.slot, i.kind])).toEqual([
      ['outer', 'garment'],
      ['bottom', 'product'],
    ]);
  });

  it('받침에 따라 이/가', () => {
    expect(iga('가방')).toBe('가방이');
    expect(iga('모자')).toBe('모자가');
    expect(iga('액세서리')).toBe('액세서리가');
  });
});
