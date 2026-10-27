import type { LookResult } from './matching';
import type { Look } from './types';

// 룩 검색: 직접 만든 룩 JSON의 태그·제목·아이템 이름에서 찾는다.

/** 검색어에 붙어도 뜻이 없는 말 */
const STOPWORDS = new Set(['코디', '룩', '스타일', '옷']);

export function tokenize(q: string): string[] {
  return q
    .split(/[\s·,/]+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOPWORDS.has(t));
}

function haystack(look: Look): string[] {
  return [...look.tags, look.title, ...look.items.flatMap((i) => [i.alias, i.title])];
}

/** 낱말 하나라도 태그·제목·아이템 이름에 들어 있으면 결과에 넣는다(순서는 데이터 순서 = 추천순). */
export function matchesQuery(look: Look, q: string): boolean {
  const tokens = tokenize(q);
  if (tokens.length === 0) return true;
  const hay = haystack(look);
  return tokens.some((t) => hay.some((h) => h.includes(t)));
}

/** '내 옷으로 찾기': 그 옷이 아이템 하나와 짝지어지는(있음·대체 가능) 룩 */
export const usesGarment = (r: LookResult, garmentId: string) => r.items.some((i) => i.verdict !== 'none' && i.garment?.id === garmentId);

export const isComplete = (r: LookResult) => r.own === r.total;

// 추천어: 자주 찾는 말(시안) + 룩 태그 조합
const SUGGEST = [
  '가을 남자 코트 코디',
  '가을 남자 코트 출근룩',
  '가을 남자 트렌치 코트',
  '가을 남자 패딩 코디',
  '겨울 남자 코트 코디',
  '남자 카고 팬츠 코디',
  '블랙 숏 패딩 코디',
  '카모 팬츠 코디',
];

export interface Suggestion {
  text: string;
  pre: string;
  hit: string;
  post: string;
}

export function suggest(q: string, looks: Look[], limit = 6): Suggestion[] {
  const needle = q.trim();
  if (!needle) return [];
  const pool = [...SUGGEST, ...looks.map((l) => l.title)];
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const text of pool) {
    const i = text.indexOf(needle);
    if (i < 0 || seen.has(text)) continue;
    seen.add(text);
    out.push({ text, pre: text.slice(0, i), hit: needle, post: text.slice(i + needle.length) });
    if (out.length >= limit) break;
  }
  return out;
}

export const SITUATIONS = ['출근', '데이트', '여행', '하객', '캠퍼스'];
export const SEASONS = ['봄·가을', '여름', '겨울'];

/** 받침에 따라 와/과 */
export function wagwa(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const has = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${has ? '과' : '와'}`;
}
