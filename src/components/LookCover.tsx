import { assetUrl } from '../domain/looks';
import type { Look, Slot } from '../domain/types';
import styles from './LookCover.module.css';

// 룩 사진. 사진이 없는 룩은 아이템 색으로 칠한 옷 모양을 늘어놓는다(시안 룩 카드).
const parts: { slot: Slot; d: string; className: string }[] = [
  { slot: 'outer', d: 'M28 10 L8 24 L14 66 L26 64 L26 92 L74 92 L74 64 L86 66 L92 24 L72 10 Q50 22 28 10Z', className: styles.outer },
  { slot: 'top', d: 'M30 12 L10 26 L18 46 L30 40 L30 90 L70 90 L70 40 L82 46 L90 26 L70 12 Q50 24 30 12Z', className: styles.top },
  { slot: 'bottom', d: 'M28 6 L72 6 L78 96 L56 96 L50 34 L44 96 L22 96Z', className: styles.bottom },
  { slot: 'shoes', d: 'M6 52 L34 48 L44 58 L90 60 Q96 62 94 74 L6 74Z', className: styles.shoes },
];

export function LookCover({ look, alt }: { look: Look; alt?: string }) {
  if (look.photo) return <img src={assetUrl(look.photo)} alt={alt ?? look.title} className={styles.photo} />;
  const color = (slot: Slot) => look.items.find((i) => i.attrs.category === slot)?.colorHex;
  return (
    <div className={styles.shapes} role="img" aria-label={alt ?? `${look.title}: ${look.items.map((i) => i.alias).join(', ')}`}>
      {parts.map(
        (p) =>
          color(p.slot) && (
            <svg key={p.slot} viewBox="0 0 100 100" aria-hidden="true" className={p.className}>
              <path d={p.d} fill={color(p.slot)} stroke="var(--line-input)" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          ),
      )}
    </div>
  );
}
