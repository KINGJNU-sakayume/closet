import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GarmentThumb } from '../../components/GarmentThumb';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { Segmented } from '../../components/Segmented';
import { CLOSET_CATEGORIES, iga, isSlot } from '../../domain/catalog';
import type { Category } from '../../domain/types';
import { dragRef, type Fitting } from './useFitting';
import styles from './ClosetPanel.module.css';

type Cat = Category | 'all';
const WINDOW = 4;

// 내 옷장 패널: 옷 종류 고르기 + 타일. 데스크톱은 눌러서(또는 끌어서) 입히고, 모바일은 탭으로 입고 벗는다.
export function ClosetPanel({ fit, mobile, onCollapse }: { fit: Fitting; mobile?: boolean; onCollapse?: () => void }) {
  const [cat, setCat] = useState<Cat>('all');
  const [start, setStart] = useState(0);
  const garments = fit.garments ?? [];
  const shown = garments.filter((g) => cat === 'all' || g.attrs.category === cat);
  const catLabel = CLOSET_CATEGORIES.find((c) => c.value === cat)!.label;
  const visible = mobile ? CLOSET_CATEGORIES : CLOSET_CATEGORIES.slice(start, start + WINDOW);
  const prevOff = start === 0;
  const nextOff = start + WINDOW >= CLOSET_CATEGORIES.length;

  // 창 밖의 종류를 고른 상태로 창을 옮기면, 보이는 첫 종류를 고른다
  const move = (d: number) => {
    const s = start + d;
    setStart(s);
    const inView = CLOSET_CATEGORIES.slice(s, s + WINDOW).some((c) => c.value === cat);
    if (!inView) setCat(CLOSET_CATEGORIES[d > 0 ? s + WINDOW - 1 : s].value);
  };

  if (garments.length === 0) {
    return (
      <div className={styles.empty}>
        {!mobile && <h2 className={styles.h2}>내 옷장</h2>}
        <p>
          아직 등록한 옷이 없어요.
          <br />옷을 등록하면 여기서 아바타에 입혀 볼 수 있어요.
        </p>
        <Link to="/register" className={styles.link}>
          옷 등록하기
        </Link>
      </div>
    );
  }

  return (
    <div className={mobile ? styles.mobile : styles.panel}>
      {!mobile && (
        <div className={styles.head}>
          <div className={styles.title}>
            <h2 className={styles.h2}>내 옷장</h2>
            <span className={styles.count}>{garments.length}벌</span>
          </div>
          {onCollapse && <IconButton icon="chevronLeft" aria-label="내 옷장 접기" onClick={onCollapse} className={styles.edgeRight} />}
        </div>
      )}
      <div className={styles.cats}>
        {!mobile && <IconButton icon="chevronLeft" aria-label="이전 종류" disabled={prevOff} onClick={() => move(-1)} className={styles.arrow} />}
        <div className={styles.catList}>
          <Segmented label="옷 종류" scroll={mobile} value={cat} onChange={setCat} options={visible.map((c) => ({ value: c.value, label: c.label }))} />
        </div>
        {!mobile && <IconButton icon="chevronRight" aria-label="다음 종류" disabled={nextOff} onClick={() => move(1)} className={styles.arrow} />}
      </div>
      <div className={styles.scroll}>
        {!mobile && <p className={styles.help}>끌어서 아바타에 놓거나, 눌러서 입혀 보세요.</p>}
        {shown.length > 0 ? (
          <div className={styles.grid}>
            {shown.map((g) => {
              const ref = { garmentId: g.id };
              const worn = fit.isWorn(ref);
              const slot = g.attrs.category;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={styles.tile}
                  draggable={!mobile}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', dragRef(ref));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => (mobile && worn && isSlot(slot) ? fit.remove(slot) : fit.wear(ref))}
                  aria-pressed={mobile ? worn : undefined}
                  aria-label={`${g.alias}${worn ? ', 입는 중' : ', 아바타에 입히기'}`}
                >
                  <span className={[styles.thumb, worn && styles.worn].filter(Boolean).join(' ')}>
                    <GarmentThumb image={g.cutout} category={g.attrs.category} colorHex={g.colorHex} alt="" inset={g.cutout ? 10 : 19} />
                    {mobile && worn && (
                      <span className={styles.check} aria-hidden="true">
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className={styles.name}>{g.alias}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyCat}>
            아직 등록한 {iga(catLabel)} 없어요.
            <br />
            <Link to="/register" className={styles.link}>
              옷 등록하기
            </Link>
          </p>
        )}
        {mobile && shown.length > 0 && <p className={styles.help}>탭하면 입히고, 한 번 더 탭하면 벗어요.</p>}
      </div>
    </div>
  );
}
