import type { ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './ProgressBar.module.css';

// 진행 표시: '내 옷 N/M' + 강조색 막대. 모든 화면에서 같은 모양.
interface Props {
  own: number;
  total: number;
  /** 오른쪽 문구: '내 옷으로 완성'(강조색) 또는 'N벌 부족' */
  aside?: ReactNode;
  asideAccent?: boolean;
  /** 부족한 옷이 모두 쇼핑 리스트에 있을 때 */
  inList?: boolean;
}

export function ProgressBar({ own, total, aside, asideAccent, inList }: Props) {
  const pct = total > 0 ? Math.round((own / total) * 100) : 0;
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <span className={styles.label}>
          내 옷 {own}/{total}
        </span>
        {aside && <span className={asideAccent ? styles.asideAccent : styles.aside}>{aside}</span>}
      </div>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
      {inList && (
        <span className={styles.note}>
          <Icon name="bookmark" size={12} strokeWidth={2} />
          부족한 옷이 쇼핑 리스트에 있어요
        </span>
      )}
    </div>
  );
}
