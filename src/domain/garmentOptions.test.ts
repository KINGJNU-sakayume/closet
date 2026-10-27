import { describe, expect, it } from 'vitest';
import { nearestColor, suggestAlias, summarize } from './garmentOptions';

describe('옷 등록 값', () => {
  it('별칭 = 색 + 종류 세부명', () => {
    expect(suggestAlias('top', '화이트')).toBe('화이트 롱슬리브 티');
    expect(suggestAlias('top', '블랙')).toBe('블랙 롱슬리브 티');
    expect(suggestAlias('outer', '블랙')).toBe('블랙 자켓');
  });

  it('요약 문구', () => {
    expect(summarize('top', '화이트', 'oversized', ['winter', 'spring_fall'])).toBe('상의 · 화이트 · 오버핏 · 봄·가을·겨울');
  });

  it('사진 평균색 → 가까운 색 계열', () => {
    expect(nearestColor([238, 238, 236])).toBe('화이트');
    expect(nearestColor([30, 30, 30])).toBe('블랙');
    expect(nearestColor([40, 50, 80])).toBe('네이비');
  });
});
