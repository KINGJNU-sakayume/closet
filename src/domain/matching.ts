import { SCORE, THRESHOLD } from './matching.config';
import type { Garment, Look, MatchOverride, Product, ShoppingItem } from './types';

export type Verdict = 'own' | 'alt' | 'none';

export interface ItemResult {
  product: Product;
  verdict: Verdict;
  /** 가장 점수가 높은 내 옷(없음이면 비어 있음) */
  garment?: Garment;
  score: number;
  /** 같은 상품이라 바로 있음 */
  sameProduct?: boolean;
  /** 사용자 보정으로 대체 가능 */
  overridden?: boolean;
}

export interface LookResult {
  look: Look;
  items: ItemResult[];
  /** 있음 + 대체 가능 */
  own: number;
  total: number;
  missing: Product[];
  /** 부족한 옷이 모두 쇼핑 리스트에 있음 */
  missingInList: boolean;
}

/** 같은 종류의 옷끼리 100점 만점. 한쪽에 핏·길이 값이 없으면 맞은 것으로 친다. */
export function score(product: Product, garment: Garment): number {
  const p = product.attrs;
  const g = garment.attrs;
  let s = 0;
  if (p.colorFamily === g.colorFamily) s += SCORE.color;
  if (!p.fit || !g.fit || p.fit === g.fit) s += SCORE.fit;
  if (!p.length || !g.length || p.length === g.length) s += SCORE.length;
  if (p.seasons.some((x) => g.seasons.includes(x))) s += SCORE.season;
  return s;
}

export function isSameProduct(product: Product, garment: Garment): boolean {
  return garment.fromProductId === product.id || (!!garment.sourceTitle && garment.sourceTitle === product.title);
}

export function judgeItem(product: Product, garments: Garment[], override?: MatchOverride): ItemResult {
  const candidates = garments.filter((g) => g.attrs.category === product.attrs.category);

  const same = candidates.find((g) => isSameProduct(product, g));
  if (same) return { product, verdict: 'own', garment: same, score: score(product, same), sameProduct: true };

  // 색 계열이 다르면 점수와 상관없이 없음이라 같은 색만 후보로 남긴다. 같은 점수면 먼저 등록된 옷.
  let best: Garment | undefined;
  let bestScore = -1;
  for (const g of candidates) {
    if (g.attrs.colorFamily !== product.attrs.colorFamily) continue;
    const s = score(product, g);
    if (s > bestScore) {
      best = g;
      bestScore = s;
    }
  }

  const verdict: Verdict = !best ? 'none' : bestScore >= THRESHOLD.own ? 'own' : bestScore >= THRESHOLD.alt ? 'alt' : 'none';

  if (verdict === 'none' && override) {
    const g = garments.find((x) => x.id === override.garmentId);
    if (g) return { product, verdict: 'alt', garment: g, score: score(product, g), overridden: true };
  }

  return verdict === 'none' ? { product, verdict, score: Math.max(bestScore, 0) } : { product, verdict, garment: best, score: bestScore };
}

export function judgeLook(look: Look, garments: Garment[], overrides: MatchOverride[] = [], shopping: ShoppingItem[] = []): LookResult {
  const items = look.items.map((p) =>
    judgeItem(
      p,
      garments,
      overrides.find((o) => o.lookId === look.id && o.productId === p.id),
    ),
  );
  const missing = items.filter((i) => i.verdict === 'none').map((i) => i.product);
  const wanted = new Set(shopping.filter((s) => s.status === 'wanted').map((s) => s.productId));
  return {
    look,
    items,
    own: items.length - missing.length,
    total: items.length,
    missing,
    missingInList: missing.length > 0 && missing.every((p) => wanted.has(p.id)),
  };
}

export type LookSort = 'reco' | 'mine';

/** 추천순 = 데이터 순서, 내 옷 많은 순 = 비율 내림차순(같으면 데이터 순서) */
export function sortLooks(results: LookResult[], sort: LookSort): LookResult[] {
  if (sort === 'reco') return results;
  const ratio = (r: LookResult) => (r.total ? r.own / r.total : 0);
  return [...results].sort((a, b) => ratio(b) - ratio(a));
}
