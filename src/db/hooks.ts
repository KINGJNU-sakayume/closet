import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import type { Worn } from '../domain/catalog';
import { judgeLook, type LookResult } from '../domain/matching';
import { loadLooks } from '../domain/looks';
import type { Look } from '../domain/types';
import { db } from './db';
import { WORN } from './seed';

export const useGarments = () => useLiveQuery(() => db.garments.orderBy('createdAt').toArray());
export const useOutfits = () => useLiveQuery(() => db.outfits.orderBy('createdAt').toArray());
export const useShopping = () => useLiveQuery(() => db.shopping.where('status').equals('wanted').sortBy('addedAt'));
export const useOverrides = () => useLiveQuery(() => db.overrides.toArray());

/** 헤더·탭 바의 쇼핑 리스트 숫자 = 지금 담겨 있는 개수 */
export const useShoppingCount = () => useLiveQuery(() => db.shopping.where('status').equals('wanted').count(), [], 0);

let looksPromise: Promise<Look[]> | undefined;

export function useLooks(): Look[] | undefined {
  const [looks, setLooks] = useState<Look[]>();
  useEffect(() => {
    let alive = true;
    looksPromise ??= loadLooks();
    looksPromise.then((l) => alive && setLooks(l));
    return () => {
      alive = false;
    };
  }, []);
  return looks;
}

/** 모든 룩의 판정 결과(데이터 순서). 내 옷·보정·쇼핑 리스트가 바뀌면 다시 계산한다. */
export function useLookResults(): LookResult[] | undefined {
  const looks = useLooks();
  const garments = useGarments();
  const overrides = useOverrides();
  const shopping = useShopping();
  return useMemo(() => {
    if (!looks || !garments || !overrides || !shopping) return undefined;
    return looks.map((l) => judgeLook(l, garments, overrides, shopping));
  }, [looks, garments, overrides, shopping]);
}

/** 피팅룸 아바타가 지금 입고 있는 옷(새로고침해도 유지) */
export const useWorn = () =>
  useLiveQuery(async () => {
    const row = await db.meta.get(WORN);
    return (row ? JSON.parse(row.value) : {}) as Worn;
  });
