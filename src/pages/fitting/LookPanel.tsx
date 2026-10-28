import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ButtonExternal, ButtonLink } from '../../components/Button';
import { GarmentThumb } from '../../components/GarmentThumb';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { LookCover } from '../../components/LookCover';
import { ProgressBar } from '../../components/ProgressBar';
import { Verdict } from '../../components/Verdict';
import { addToShopping, deleteOverride, putOverride } from '../../db/actions';
import { categoryLabel } from '../../domain/garmentOptions';
import { assetUrl } from '../../domain/looks';
import type { ItemResult, LookResult } from '../../domain/matching';
import { useFocusNext } from '../../hooks/useFocusNext';
import { dragRef, type Fitting } from './useFitting';
import styles from './LookPanel.module.css';

export function headline(r: LookResult): string {
  const missing = r.total - r.own;
  if (missing === 0) return '내 옷으로 완성할 수 있어요';
  if (missing === 1) return '1벌만 더 있으면 완성';
  return `${missing}벌 더 있으면 완성`;
}

// 룩 상세: 룩 사진 + 내 옷 N/M + 아이템별 판정과 동작
export function LookPanel({ fit, mobile, onCollapse }: { fit: Fitting; mobile?: boolean; onCollapse?: () => void }) {
  const r = fit.result;
  if (!r) {
    return (
      <div className={styles.none}>
        {!mobile && (
          <div className={styles.top}>
            <span className={styles.kicker}>룩 상세</span>
            {onCollapse && <IconButton icon="chevronRight" aria-label="룩 상세 접기" onClick={onCollapse} className={styles.edge} />}
          </div>
        )}
        <p>룩을 고르면 아이템마다 내 옷과 비교해 보여 줘요.</p>
        <ButtonLink to="/explore" variant="text">
          룩 둘러보기
          <Icon name="arrowRight" size={16} />
        </ButtonLink>
      </div>
    );
  }
  return (
    <div className={mobile ? styles.mobile : styles.panel}>
      {!mobile && (
        <div className={styles.top}>
          <span className={styles.kicker}>룩 상세</span>
          {onCollapse && <IconButton icon="chevronRight" aria-label="룩 상세 접기" onClick={onCollapse} className={styles.edge} />}
        </div>
      )}
      <div className={styles.summary}>
        <div className={styles.cover}>
          <LookCover look={r.look} />
        </div>
        <div className={styles.meta}>
          <div>
            <h2 className={styles.title}>{r.look.title}</h2>
            <div className={styles.source}>{r.look.source}</div>
          </div>
          <ProgressBar own={r.own} total={r.total} aside={headline(r)} />
        </div>
      </div>
      <ul className={styles.items}>
        {r.items.map((i) => (
          <LookItem key={i.product.id} item={i} lookId={r.look.id} fit={fit} mobile={mobile} />
        ))}
      </ul>
    </div>
  );
}

function LookItem({ item, lookId, fit, mobile }: { item: ItemResult; lookId: string; fit: Fitting; mobile?: boolean }) {
  const [picking, setPicking] = useState(false);
  const [root, focusNext] = useFocusNext<HTMLLIElement>();
  const p = item.product;
  const owned = item.verdict !== 'none' && item.garment;
  const ref = owned ? { garmentId: item.garment!.id } : { productId: p.id };
  const listed = fit.wanted.has(p.id);
  const candidates = (fit.garments ?? []).filter((g) => g.attrs.category === p.attrs.category);
  const cat = categoryLabel(p.attrs.category);

  return (
    <li
      ref={root}
      className={styles.item}
      draggable={!mobile}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', dragRef(ref))}
    >
      <div className={styles.thumb}>
        <GarmentThumb image={p.image ? assetUrl(p.image) : undefined} category={p.attrs.category} colorHex={p.colorHex} alt="" inset={11} />
      </div>
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.name}>{p.alias}</span>
          <Verdict verdict={item.verdict} size={mobile ? 'sm' : 'md'} />
        </div>
        {!mobile && p.title !== p.alias && <div className={styles.full}>{p.title}</div>}
        {item.verdict === 'alt' && item.garment && <div className={styles.detail}>→ 내 {item.garment.alias}</div>}
        <div className={styles.actions}>
          <Button variant="text" onClick={() => fit.wear(ref)}>
            <Icon name="hanger" />
            {owned ? '내 옷으로 입혀보기' : '입혀보기'}
          </Button>
          {item.verdict === 'none' &&
            (listed ? (
              <Link to="/shopping" className={styles.listed}>
                <Icon name="bookmark" size={14} />
                쇼핑 리스트에 있어요
              </Link>
            ) : (
              <Button
                variant="text"
                accent
                onClick={() => {
                  focusNext('쇼핑 리스트에 있어요');
                  void addToShopping([p.id]);
                }}
              >
                <Icon name="plus" size={14} />
                쇼핑 리스트에 담기
              </Button>
            ))}
          {item.verdict === 'none' && p.url && (
            <ButtonExternal variant="text" href={p.url} className={styles.subtle}>
              구매처
              <Icon name="external" size={14} />
            </ButtonExternal>
          )}
          {item.overridden && (
            <Button variant="text" className={styles.subtle} onClick={() => {
                focusNext('이미 비슷한 옷이 있어요');
                void deleteOverride(lookId, p.id);
              }}
            >
              되돌리기
            </Button>
          )}
        </div>
        {item.verdict === 'none' && !picking && candidates.length > 0 && (
          <Button variant="text" className={styles.subtle} onClick={() => {
              focusNext(candidates[0]?.alias ?? '취소');
              setPicking(true);
            }}
          >
            이미 비슷한 옷이 있어요
          </Button>
        )}
        {picking && (
          <div className={styles.picker} role="group" aria-label={`비슷한 내 ${cat} 고르기`}>
            <div className={styles.pickTitle}>내 {cat} 중에서 비슷한 옷을 골라 주세요</div>
            {candidates.map((g) => (
              <button
                key={g.id}
                type="button"
                className={styles.pick}
                onClick={async () => {
                  focusNext('되돌리기');
                  await putOverride({ lookId, productId: p.id, garmentId: g.id });
                  setPicking(false);
                }}
              >
                <span className={styles.pickThumb}>
                  <GarmentThumb image={g.cutout} category={g.attrs.category} colorHex={g.colorHex} alt="" inset={10} />
                </span>
                {g.alias}
              </button>
            ))}
            <Button
              variant="text"
              className={styles.subtle}
              onClick={() => {
                focusNext('이미 비슷한 옷이 있어요');
                setPicking(false);
              }}
            >
              취소
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}
