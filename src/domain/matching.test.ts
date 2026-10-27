import { describe, expect, it } from 'vitest';
import { completesCount, usageCount } from './closet';
import { judgeItem, judgeLook, sortLooks, type Verdict } from './matching';
import { seedGarmentsWithoutImages, seedOutfits, seedShopping } from './seed';
import { readLooks } from './testData';
import type { Garment, Product } from './types';

const garments = seedGarmentsWithoutImages();
const looks = readLooks();
const results = looks.map((l) => judgeLook(l, garments, [], seedShopping));
const byTitle = (t: string) => results.find((r) => r.look.title === t)!;
const g = (id: string) => garments.find((x) => x.id === id)!;

const product = (over: Partial<Product> & Pick<Product, 'attrs'>): Product => ({ id: 'p', title: '', alias: '', shop: '', ...over });
const garment = (over: Partial<Garment> & Pick<Garment, 'attrs'>): Garment => ({ id: 'g', alias: '', createdAt: '', ...over });

describe('판정 규칙 고정 3경우', () => {
  it('블랙 숏 패딩 점퍼 vs 블랙 푸퍼 자켓 → 대체 가능', () => {
    const p = product({ attrs: { category: 'outer', colorFamily: '블랙', fit: 'oversized', length: 'cropped', seasons: ['winter'] } });
    const mine = garment({ attrs: { category: 'outer', colorFamily: '블랙', fit: 'regular', length: 'cropped', seasons: ['spring_fall', 'winter'] } });
    expect(judgeItem(p, [mine])).toMatchObject({ verdict: 'alt', score: 80 });
  });

  it('화이트 롱슬리브 티(같은 원본 상품명) → 있음', () => {
    const p = product({ title: 'FN DOODLE LONG SLV TEE white', attrs: { category: 'top', colorFamily: '화이트', fit: 'slim', seasons: ['summer'] } });
    const mine = garment({ sourceTitle: 'FN DOODLE LONG SLV TEE white', attrs: { category: 'top', colorFamily: '화이트', fit: 'oversized', seasons: ['winter'] } });
    expect(judgeItem(p, [mine])).toMatchObject({ verdict: 'own', sameProduct: true });
  });

  it('카모 와이드 카고 팬츠 vs 데님·슬랙스·치노(색 다름) → 없음', () => {
    const camo = looks.find((l) => l.id === 'l_camo')!.items.find((p) => p.id === 'p_camo')!;
    const bottoms = [g('g_denim'), g('g_slacks'), g('g_chino')];
    expect(judgeItem(camo, bottoms).verdict).toBe('none');
  });
});

describe('판정 세부', () => {
  it('종류가 다르면 후보에서 빠진다', () => {
    const p = product({ attrs: { category: 'outer', colorFamily: '화이트', seasons: ['winter'] } });
    expect(judgeItem(p, [g('g_tee'), g('g_sneak')]).verdict).toBe('none');
  });

  it('fromProductId가 같으면 점수와 상관없이 있음', () => {
    const p = product({ id: 'p_x', attrs: { category: 'top', colorFamily: '레드', seasons: ['summer'] } });
    const mine = garment({ fromProductId: 'p_x', attrs: { category: 'top', colorFamily: '블루', seasons: ['winter'] } });
    expect(judgeItem(p, [mine]).verdict).toBe('own');
  });

  it('사용자 보정은 없음을 대체 가능으로 바꾸고, 지우면 되돌아간다', () => {
    const camo = looks.find((l) => l.id === 'l_camo')!;
    const fixed = judgeLook(camo, garments, [{ lookId: 'l_camo', productId: 'p_camo', garmentId: 'g_denim' }]);
    expect(fixed.items[2]).toMatchObject({ verdict: 'alt', overridden: true, garment: { id: 'g_denim' } });
    expect(`${fixed.own}/${fixed.total}`).toBe('3/3');
    expect(judgeLook(camo, garments).own).toBe(2);
  });

  it('보정은 그 룩에서만 적용된다', () => {
    const navy = looks.find((l) => l.id === 'l_navy')!;
    const r = judgeLook(navy, garments, [{ lookId: 'l_camo', productId: 'p_navy', garmentId: 'g_trench' }]);
    expect(r.items[0].verdict).toBe('none');
  });
});

// 지시서 '예시 데이터와 기대 결과' 표
type Row = [title: string, ratio: string, items: [Verdict, string?, number?][]];
const table: Row[] = [
  ['베이지 트렌치 출근룩', '4/4', [['own'], ['own'], ['own'], ['own']]],
  ['그레이 후드 레이어드', '4/4', [['own'], ['own'], ['own'], ['own']]],
  ['네이비 코트 미니멀', '3/4', [['none'], ['alt', 'g_tee', 80], ['own'], ['own']]],
  ['브라운 코트 캠퍼스룩', '3/4', [['none'], ['alt', 'g_tee', 80], ['own', 'g_chino'], ['own', 'g_chelsea']]],
  ['카키 필드 재킷', '3/4', [['none'], ['own', 'g_knit'], ['own'], ['own']]],
  ['카모 카고 스트릿 코디', '2/3', [['alt', 'g_jacket', 80], ['own', 'g_tee'], ['none']]],
  ['차콜 롱코트 다크톤', '2/4', [['none'], ['own'], ['own'], ['none']]],
  ['데님 온 데님', '1/4', [['none'], ['none'], ['own'], ['none']]],
];

describe('예시 데이터 기대 결과', () => {
  it.each(table)('%s %s', (title, ratio, items) => {
    const r = byTitle(title);
    expect(`${r.own}/${r.total}`).toBe(ratio);
    items.forEach(([verdict, garmentId, s], i) => {
      expect(r.items[i].verdict, r.items[i].product.alias).toBe(verdict);
      if (garmentId) expect(r.items[i].garment?.id).toBe(garmentId);
      if (s !== undefined) expect(r.items[i].score).toBe(s);
    });
  });

  it('카모 룩의 화이트 롱슬리브 티는 같은 상품명으로 있음', () => {
    expect(byTitle('카모 카고 스트릿 코디').items[1].sameProduct).toBe(true);
  });

  it("'내 옷 많은 순'은 표의 순서", () => {
    expect(sortLooks(results, 'mine').map((r) => r.look.title)).toEqual(table.map((t) => t[0]));
  });

  it("'추천순'은 데이터 순서, 카모 카고가 첫 번째", () => {
    const sorted = sortLooks(results, 'reco');
    expect(sorted[0].look.title).toBe('카모 카고 스트릿 코디');
    expect(sorted.map((r) => r.look.id)).toEqual(looks.map((l) => l.id));
  });

  it('부족한 옷이 쇼핑 리스트에 있는 룩: 네이비 코트, 카키 필드 재킷', () => {
    expect(results.filter((r) => r.missingInList).map((r) => r.look.title)).toEqual(['네이비 코트 미니멀', '카키 필드 재킷']);
  });

  it('카모 팬츠를 담으면 카모 룩도 쇼핑 리스트 표시', () => {
    const camo = looks.find((l) => l.id === 'l_camo')!;
    const withCamo = [...seedShopping, { productId: 'p_camo', status: 'wanted' as const, addedAt: '' }];
    expect(judgeLook(camo, garments, [], withCamo).missingInList).toBe(true);
  });
});

describe('사면 완성되는 코디 수', () => {
  it('네이비 울 코트 1, 카키 필드 재킷 1, 카모 와이드 카고 팬츠 2', () => {
    expect(completesCount('p_navy', results, seedOutfits)).toBe(1);
    expect(completesCount('p_khaki', results, seedOutfits)).toBe(1);
    expect(completesCount('p_camo', results, seedOutfits)).toBe(2);
  });
});

describe("내 옷장 '코디 N개에 쓰임'", () => {
  it('화이트 스니커즈 3, 블랙 푸퍼 자켓·롱 트렌치 코트·화이트 롱슬리브 티 2, 나머지 1', () => {
    const counts = Object.fromEntries(garments.map((x) => [x.alias, usageCount(x.id, seedOutfits)]));
    expect(counts).toEqual({
      '화이트 스니커즈': 3,
      '블랙 푸퍼 자켓': 2,
      '롱 트렌치 코트': 2,
      '화이트 롱슬리브 티': 2,
      '그레이 후드': 1,
      '블랙 니트': 1,
      '데님 팬츠': 1,
      '블랙 슬랙스': 1,
      '와이드 치노 팬츠': 1,
      '첼시 부츠': 1,
    });
  });
});
