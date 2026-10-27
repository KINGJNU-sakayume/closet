import type { LookResult } from './matching';
import type { Outfit } from './types';

/** 내 옷장 '코디 N개에 쓰임' */
export function usageCount(garmentId: string, outfits: Outfit[]): number {
  return outfits.filter((o) => Object.values(o.slots).some((s) => s?.garmentId === garmentId)).length;
}

export function outfitProductIds(outfit: Outfit): string[] {
  return Object.values(outfit.slots).flatMap((s) => (s?.productId ? [s.productId] : []));
}

/**
 * 쇼핑 리스트 '사면 완성되는 코디 N개'. 저장하지 않고 매번 계산한다.
 * 룩은 그 상품이 유일하게 빠진 아이템일 때, 코디는 그 상품 말고 다른 쇼핑몰 상품이 없을 때 센다.
 */
export function completesCount(productId: string, lookResults: LookResult[], outfits: Outfit[]): number {
  const looks = lookResults.filter((r) => r.missing.length === 1 && r.missing[0].id === productId).length;
  const outs = outfits.filter((o) => {
    const ids = outfitProductIds(o);
    return ids.length > 0 && ids.every((id) => id === productId);
  }).length;
  return looks + outs;
}
