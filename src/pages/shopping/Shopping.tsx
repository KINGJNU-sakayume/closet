import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonExternal, ButtonLink } from '../../components/Button';
import { GarmentThumb } from '../../components/GarmentThumb';
import { Icon } from '../../components/Icon';
import { Segmented } from '../../components/Segmented';
import { markBought, removeFromShopping, undoBought } from '../../db/actions';
import { useLookResults, useLooks, useOutfits, useShoppingAll } from '../../db/hooks';
import { productIndex } from '../../domain/catalog';
import { assetUrl } from '../../domain/looks';
import { shoppingRows, totalPrice, type ShoppingRow, type ShoppingSort } from '../../domain/shopping';
import { useFocusNext } from '../../hooks/useFocusNext';
import styles from './Shopping.module.css';

const SORTS: { value: ShoppingSort; label: string }[] = [
  { value: 'unlock', label: '완성 많은 순' },
  { value: 'recent', label: '최근 담은 순' },
];

// 쇼핑 리스트: 사면 완성되는 코디가 많은 옷이 위. 구매는 쇼핑몰에서, 산 뒤 '샀어요'로 옷장에 옮긴다.
export function Shopping() {
  const [sort, setSort] = useState<ShoppingSort>('unlock');
  // 이 화면에서 '샀어요'를 누른 상품 → 만든 옷 id(되돌리기용)와 누르기 전의 행.
  // 사면 그 옷이 내 옷이 되어 '사면 완성되는 코디'가 0이 되므로, 누르기 전 모습과 자리를 그대로 둔다. 화면을 떠나면 목록에서 빠진다.
  const [bought, setBought] = useState<Record<string, { garmentId: string; row: ShoppingRow }>>({});
  const looks = useLooks();
  const results = useLookResults();
  const outfits = useOutfits();
  const all = useShoppingAll();
  const products = useMemo(() => productIndex(looks ?? []), [looks]);
  // '샀어요'·'되돌리기'를 누르면 그 버튼이 사라지므로, 같은 행의 반대 버튼으로 포커스를 옮긴다
  const [list, focusNext] = useFocusNext<HTMLUListElement>();

  if (!looks || !results || !outfits || !all) return <main className={styles.page} aria-busy="true" />;

  const rows = shoppingRows(
    all.filter((i) => i.status === 'wanted'),
    products,
    results,
    outfits,
    sort,
    Object.values(bought).map((b) => b.row),
  );
  const active = rows.filter((r) => !bought[r.product.id]);
  const total = totalPrice(active.map((r) => r.product));

  const buy = async (r: ShoppingRow) => {
    const garmentId = await markBought(r.product);
    focusNext(`${r.product.alias}: 되돌리기`);
    setBought((b) => ({ ...b, [r.product.id]: { garmentId, row: r } }));
  };
  const undo = async (r: ShoppingRow) => {
    await undoBought(r.product.id, bought[r.product.id].garmentId);
    focusNext(`${r.product.alias}: 샀어요`);
    setBought(({ [r.product.id]: _, ...rest }) => rest);
  };

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>쇼핑 리스트</h1>
          <p className={styles.sub}>아직 없는 옷만 모았어요. 더 많은 코디를 완성하는 옷이 위에 있어요.</p>
        </div>
        {rows.length > 0 && (
          <div className={styles.controls}>
            <div className={styles.count}>
              <strong>{active.length}벌</strong>
              <span className={styles.muted}> · {total !== undefined ? `합계 ${total.toLocaleString('ko-KR')}원` : '가격은 쇼핑몰에서 확인해요'}</span>
            </div>
            <Segmented label="정렬" value={sort} onChange={setSort} options={SORTS} />
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>쇼핑 리스트가 비었어요</h2>
          <p className={styles.muted}>룩에서 없는 옷을 담으면 여기에 모여요.</p>
          <ButtonLink to="/explore">룩 둘러보기</ButtonLink>
        </div>
      ) : (
        <ul className={styles.list} ref={list}>
          {rows.map((r) => {
            const p = r.product;
            const done = !!bought[p.id];
            return (
              <li key={p.id} className={styles.row}>
                <div className={styles.thumb}>
                  <GarmentThumb image={p.image ? assetUrl(p.image) : undefined} category={p.attrs.category} colorHex={p.colorHex} alt="" inset={p.image ? 9 : 22} />
                </div>
                <div className={styles.info}>
                  <div>
                    <h2 className={styles.name}>{p.alias}</h2>
                    <div className={styles.meta}>
                      {p.shop}
                      {typeof p.price === 'number' && ` · ${p.price.toLocaleString('ko-KR')}원`}
                    </div>
                  </div>
                  {r.count > 0 && (
                    <div>
                      <div className={styles.unlock}>사면 완성되는 코디 {r.count}개</div>
                      <div className={styles.links}>
                        {r.unlocks.map((u) => (
                          <Link key={u.href} to={u.href} className={styles.link}>
                            <span className={styles.kind}>{u.kind}</span>
                            <span className={styles.underline}>{u.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.actions}>
                  {done ? (
                    <>
                      <div className={styles.moved} role="status">
                        <Icon name="check" size={16} strokeWidth={2.4} />
                        옷장으로 옮겼어요
                      </div>
                      <Button variant="text" className={styles.subtle} onClick={() => undo(r)} aria-label={`${p.alias}: 되돌리기`}>
                        되돌리기
                      </Button>
                    </>
                  ) : (
                    <>
                      {p.url ? (
                        <ButtonExternal href={p.url} block>
                          구매하러 가기
                          <Icon name="external" size={14} />
                          <span className="visually-hidden">(새 탭)</span>
                        </ButtonExternal>
                      ) : (
                        <Button block disabled title="구매처 링크가 없어요">
                          구매처 링크 없음
                        </Button>
                      )}
                      <div className={styles.small}>
                        <Button variant="text" onClick={() => buy(r)} aria-label={`${p.alias}: 샀어요`}>
                          <Icon name="check" size={16} strokeWidth={2} />
                          샀어요
                        </Button>
                        <Button variant="text" className={styles.subtle} aria-label={`${p.alias} 쇼핑 리스트에서 빼기`} onClick={() => removeFromShopping(p.id)}>
                          빼기
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className={styles.note}>결제는 각 쇼핑몰에서 해요. 산 뒤 ‘샀어요’를 누르면 그 옷이 내 옷장으로 옮겨지고, 이 옷으로 완성되는 코디가 ‘지금 입을 수 있어요’로 바뀌어요.</p>
    </main>
  );
}
