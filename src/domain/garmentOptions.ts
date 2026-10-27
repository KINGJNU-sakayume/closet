import type { Category, Fit, Season } from './types';

// 옷 등록에서 고르는 값과 화면 문구. 순서는 시안(Register.dc.html) 그대로.
export const CATEGORY_OPTIONS: { value: Category; label: string; subtype: string }[] = [
  { value: 'outer', label: '아우터', subtype: '자켓' },
  { value: 'top', label: '상의', subtype: '롱슬리브 티' },
  { value: 'bottom', label: '하의', subtype: '팬츠' },
  { value: 'shoes', label: '신발', subtype: '스니커즈' },
];

export const COLOR_OPTIONS: { value: string; hex: string }[] = [
  { value: '화이트', hex: '#F2F2EE' },
  { value: '블랙', hex: '#2B2B29' },
  { value: '그레이', hex: '#8A8D92' },
  { value: '네이비', hex: '#1F2F4D' },
  { value: '베이지', hex: '#C9BFA8' },
  { value: '브라운', hex: '#6B4A36' },
  { value: '카키', hex: '#5B6148' },
  { value: '블루', hex: '#4A6A8F' },
];

export const FIT_OPTIONS: { value: Fit; label: string }[] = [
  { value: 'slim', label: '슬림' },
  { value: 'regular', label: '레귤러' },
  { value: 'oversized', label: '오버핏' },
  { value: 'wide', label: '와이드' },
];

export const SEASON_OPTIONS: { value: Season; label: string }[] = [
  { value: 'spring_fall', label: '봄·가을' },
  { value: 'summer', label: '여름' },
  { value: 'winter', label: '겨울' },
];

const label = <T extends string>(list: { value: T; label: string }[], v: T | undefined) => list.find((o) => o.value === v)?.label;

export const categoryLabel = (c: Category) => label(CATEGORY_OPTIONS, c) ?? c;

/** 별칭 제안 = 색 + 종류 세부명. 예: '화이트 롱슬리브 티' */
export function suggestAlias(category: Category, color: string): string {
  const subtype = CATEGORY_OPTIONS.find((c) => c.value === category)?.subtype ?? '';
  return `${color} ${subtype}`.trim();
}

/** 완료 화면 요약. 예: '상의 · 화이트 · 오버핏 · 봄·가을·겨울' */
export function summarize(category: Category, color: string, fit: Fit | undefined, seasons: Season[]): string {
  const ss = SEASON_OPTIONS.filter((o) => seasons.includes(o.value)).map((o) => o.label).join('·');
  return [categoryLabel(category), color, label(FIT_OPTIONS, fit), ss].filter(Boolean).join(' · ');
}

const toRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** 사진에서 뽑은 평균색을 가장 가까운 색 계열로 */
export function nearestColor(rgb: [number, number, number]): string {
  let best = COLOR_OPTIONS[0];
  let bestD = Infinity;
  for (const c of COLOR_OPTIONS) {
    const [r, g, b] = toRgb(c.hex);
    const d = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (d < bestD) {
      best = c;
      bestD = d;
    }
  }
  return best.value;
}

export const colorHex = (color: string) => COLOR_OPTIONS.find((c) => c.value === color)?.hex;
