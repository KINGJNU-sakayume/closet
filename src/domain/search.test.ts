import { describe, expect, it } from 'vitest';
import { judgeLook } from './matching';
import { seedGarmentsWithoutImages } from './seed';
import { matchesQuery, suggest, tokenize, usesGarment, wagwa } from './search';
import { readLooks } from './testData';

const looks = readLooks();
const garments = seedGarmentsWithoutImages();

describe('룩 검색', () => {
  it('‘코디’ 같은 말은 빼고 낱말로 나눈다', () => {
    expect(tokenize('가을 남자 코트 코디')).toEqual(['가을', '남자', '코트']);
    expect(tokenize('봄·가을')).toEqual(['봄', '가을']);
  });

  it('‘가을 남자 코트 코디’ 결과 8개(시나리오 3)', () => {
    expect(looks.filter((l) => matchesQuery(l, '가을 남자 코트 코디'))).toHaveLength(8);
  });

  it('상황·계절 태그로 찾는다', () => {
    expect(looks.filter((l) => matchesQuery(l, '출근')).map((l) => l.id)).toEqual(['l_trench']);
    expect(looks.filter((l) => matchesQuery(l, '하객')).map((l) => l.id)).toEqual(['l_charcoal']);
    expect(looks.filter((l) => matchesQuery(l, '여름'))).toHaveLength(0);
  });

  it('아이템 이름에서도 찾는다', () => {
    expect(looks.filter((l) => matchesQuery(l, '카고')).map((l) => l.id)).toEqual(['l_camo']);
  });

  it('추천어는 일치 부분을 나눠 준다', () => {
    const s = suggest('코트', looks);
    expect(s[0]).toEqual({ text: '가을 남자 코트 코디', pre: '가을 남자 ', hit: '코트', post: ' 코디' });
    expect(s.length).toBeLessThanOrEqual(6);
    expect(suggest('없는말', looks)).toEqual([]);
  });

  it('내 옷으로 찾기: 블랙 푸퍼 자켓과 짝지어지는 룩', () => {
    const ids = looks.map((l) => judgeLook(l, garments)).filter((r) => usesGarment(r, 'g_jacket')).map((r) => r.look.id);
    expect(ids).toEqual(['l_camo', 'l_hood']);
  });

  it('와/과', () => {
    expect(wagwa('블랙 푸퍼 자켓')).toBe('블랙 푸퍼 자켓과');
    expect(wagwa('그레이 후드')).toBe('그레이 후드와');
  });
});
