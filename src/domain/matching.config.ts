// 있음 / 대체 가능 / 없음 판정의 점수와 기준값. 값을 바꾸면 matching.test.ts의 기대 결과도 확인한다.
export const SCORE = {
  color: 50,
  fit: 20,
  length: 15,
  season: 15,
} as const;

export const THRESHOLD = {
  /** 이 점수 이상이면 있음 */
  own: 85,
  /** 이 점수 이상이면 대체 가능, 미만이면 없음 */
  alt: 50,
} as const;
