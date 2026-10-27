import { useCallback, useMemo } from 'react';
import { addToShopping, setWorn } from '../../db/actions';
import { useGarments, useLookResults, useLooks, useShopping, useWorn } from '../../db/hooks';
import { isSlot, productIndex, resolveWorn, type Worn, type WornRef } from '../../domain/catalog';
import type { Slot } from '../../domain/types';

/** 끌어다 놓기로 주고받는 참조: 내 옷 g:id, 쇼핑몰 상품 p:id */
export const dragRef = (r: WornRef) => (r.garmentId ? `g:${r.garmentId}` : `p:${r.productId}`);

// 피팅룸 상태: 입은 옷(저장소에 유지), 열린 룩의 판정 결과, 장바구니
export function useFitting(lookId?: string) {
  const looks = useLooks();
  const garments = useGarments();
  const worn = useWorn();
  const shopping = useShopping();
  const results = useLookResults();

  const products = useMemo(() => productIndex(looks ?? []), [looks]);
  const result = results?.find((r) => r.look.id === lookId);
  const items = useMemo(() => (worn && garments ? resolveWorn(worn, garments, products) : []), [worn, garments, products]);
  const wanted = useMemo(() => new Set((shopping ?? []).map((s) => s.productId)), [shopping]);

  const slotOf = useCallback(
    (ref: WornRef): Slot | undefined => {
      const cat = ref.garmentId ? garments?.find((g) => g.id === ref.garmentId)?.attrs.category : products.get(ref.productId ?? '')?.attrs.category;
      return cat && isSlot(cat) ? cat : undefined;
    },
    [garments, products],
  );

  /** 같은 슬롯은 교체 */
  const wear = useCallback(
    (ref: WornRef) => {
      const slot = slotOf(ref);
      if (!slot || !worn) return;
      void setWorn({ ...worn, [slot]: ref });
    },
    [slotOf, worn],
  );

  const wearDragged = useCallback(
    (s: string) => {
      const [kind, id] = [s.slice(0, 2), s.slice(2)];
      if (kind === 'g:') wear({ garmentId: id });
      if (kind === 'p:') wear({ productId: id });
    },
    [wear],
  );

  const remove = useCallback(
    (slot: Slot) => {
      if (!worn) return;
      const next: Worn = { ...worn };
      delete next[slot];
      void setWorn(next);
    },
    [worn],
  );

  /** 이 룩 그대로: 룩 아이템이 있는 슬롯만 바꾸고 나머지는 그대로 둔다. 가진 옷은 내 옷으로 */
  const wearLook = useCallback(() => {
    if (!result || !worn) return;
    const next: Worn = { ...worn };
    for (const i of result.items) {
      const cat = i.product.attrs.category;
      if (!isSlot(cat)) continue;
      next[cat] = i.verdict !== 'none' && i.garment ? { garmentId: i.garment.id } : { productId: i.product.id };
    }
    void setWorn(next);
  }, [result, worn]);

  const isWorn = useCallback((ref: WornRef) => items.some((i) => (i.kind === 'garment' ? i.garment.id === ref.garmentId : i.product.id === ref.productId)), [items]);

  const shopItems = items.flatMap((i) => (i.kind === 'product' ? [i.product] : []));
  const cart = {
    count: shopItems.length,
    allListed: shopItems.length > 0 && shopItems.every((p) => wanted.has(p.id)),
    listAll: () => addToShopping(shopItems.filter((p) => !wanted.has(p.id)).map((p) => p.id)),
  };

  return { ready: !!(looks && garments && worn && shopping && results), looks, garments, worn, items, result, wanted, wear, wearDragged, remove, wearLook, isWorn, cart };
}

export type Fitting = ReturnType<typeof useFitting>;
