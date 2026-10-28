import { useState, type DragEvent } from 'react';
import mannequin from '../data/mannequin.json';
import { PHOTO_PLACEMENT, SHOES_Z, SHOP_LABEL_TOP, type Placement } from '../domain/avatar.config';
import { itemName, type WornItem } from '../domain/catalog';
import { assetUrl } from '../domain/looks';
import type { Slot } from '../domain/types';
import { useObjectUrl } from './GarmentThumb';
import styles from './Avatar.module.css';

const P = mannequin.paths;
const SHAPE: Record<Slot, string> = { outer: P.coat, top: P.sweater, bottom: P.pants, shoes: P.shoes };

interface Props {
  items: WornItem[];
  /** 끌어다 놓기: 놓은 옷의 참조 문자열(g:… 또는 p:…) */
  onDrop?: (ref: string) => void;
  /** 모바일은 설명 선을 짧게 */
  compact?: boolean;
  /** 무대 폭(px). 비우면 320, compact는 228 */
  width?: number;
  /** 접근성 이름 앞부분 */
  label?: string;
}

const pct = (p: Placement) => ({
  left: `${p.left}%`,
  top: `${p.top}%`,
  width: `${p.width}%`,
  height: p.height !== undefined ? `${p.height}%` : 'auto',
  zIndex: p.z,
});

function Layer({ item, layered }: { item: WornItem; layered: boolean }) {
  const blobUrl = useObjectUrl(item.kind === 'garment' ? item.garment.cutout : undefined);
  const src = item.kind === 'garment' ? blobUrl : item.product.image ? assetUrl(item.product.image) : undefined;
  const color = item.kind === 'garment' ? item.garment.colorHex : item.product.colorHex;
  const slot = item.slot;

  if (src && slot !== 'shoes') {
    const place = slot === 'top' ? (layered ? PHOTO_PLACEMENT.topLayered : PHOTO_PLACEMENT.topAlone) : PHOTO_PLACEMENT[slot];
    return <img src={src} alt="" draggable={false} className={styles.photo} style={pct(place)} data-slot={slot} />;
  }
  const z = slot === 'shoes' ? SHOES_Z : slot === 'outer' ? PHOTO_PLACEMENT.outer.z : slot === 'top' ? PHOTO_PLACEMENT.topAlone.z : PHOTO_PLACEMENT.bottom.z;
  return (
    <svg aria-hidden="true" viewBox="0 0 320 480" className={styles.full} style={{ zIndex: z }} data-slot={slot}>
      <path d={SHAPE[slot]} fill={color ?? 'var(--bg)'} stroke="var(--line-input)" strokeWidth="1" strokeLinejoin="round" />
      {slot === 'outer' && <path d="M160 120 L160 338" stroke="var(--line-input)" strokeWidth="1" />}
    </svg>
  );
}

// 마네킹 SVG 위에 배경을 지운 옷 사진(없으면 옷 모양 SVG)을 겹치는 콜라주
export function Avatar({ items, onDrop, compact, width, label: name = '내 아바타' }: Props) {
  const [over, setOver] = useState(false);
  const hasOuter = items.some((i) => i.slot === 'outer');
  const label = `${name}. 입은 옷: ${items.map((i) => itemName(i) + (i.kind === 'product' ? '(쇼핑몰 상품)' : '')).join(', ') || '없음'}`;

  const dnd = onDrop && {
    onDragOver: (e: DragEvent) => e.preventDefault(),
    onDragEnter: (e: DragEvent) => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setOver(false);
      const ref = e.dataTransfer.getData('text/plain');
      if (ref) onDrop(ref);
    },
  };

  return (
    <div role="img" aria-label={label} className={[styles.stage, over && styles.over, compact && styles.compact].filter(Boolean).join(' ')}
      style={width ? { width } : undefined}
      {...dnd}
    >
      <svg aria-hidden="true" viewBox="0 0 320 480" className={styles.full}>
        <ellipse cx="160" cy="475" rx="58" ry="4" fill="var(--mannequin-shadow)" />
        {[P.armL, P.armR, P.body, P.head].map((d) => (
          <path key={d.slice(0, 24)} d={d} fill="var(--mannequin)" stroke="var(--mannequin-line)" strokeWidth="1.2" />
        ))}
        <path d="M146 88 Q160 95 174 88" fill="none" stroke="var(--mannequin-line)" strokeWidth="1" />
        <path d="M120 138 Q140 150 156 140 M200 138 Q180 150 164 140" fill="none" stroke="var(--mannequin-line)" strokeWidth="1" />
      </svg>
      {items.map((i) => (
        <Layer key={i.slot} item={i} layered={hasOuter} />
      ))}
      {items
        .filter((i) => i.kind === 'product')
        .map((i) => (
          <div key={`shop-${i.slot}`} className={styles.shop} style={{ top: `${SHOP_LABEL_TOP[i.slot]}%` }} aria-hidden="true">
            <span className={styles.shopLine} />
            <span className={styles.shopText}>
              <strong>쇼핑몰 상품</strong>
              아직 없는 옷
            </span>
          </div>
        ))}
      {over && <div className={styles.dropHint}>여기에 놓으면 입혀져요</div>}
    </div>
  );
}
