import { Link } from 'react-router-dom';
import type { LookResult } from '../domain/matching';
import { LookCover } from './LookCover';
import { ProgressBar } from './ProgressBar';
import styles from './LookCard.module.css';

// 룩 카드: 사진 4:5 · 제목 · 출처 · 내 옷 N/M 막대. 누르면 그 룩으로 피팅룸.
export function LookCard({ result: r, compact }: { result: LookResult; compact?: boolean }) {
  const missing = r.total - r.own;
  return (
    <Link to={`/fitting/${r.look.id}`} className={[styles.card, compact && styles.compact].filter(Boolean).join(' ')}>
      <div className={styles.cover}>
        <LookCover look={r.look} alt="" />
      </div>
      <div>
        <div className={styles.title}>{r.look.title}</div>
        {!compact && <div className={styles.source}>{r.look.source}</div>}
      </div>
      <ProgressBar
        own={r.own}
        total={r.total}
        aside={missing === 0 ? (compact ? '완성' : '내 옷으로 완성') : `${missing}벌 부족`}
        asideAccent={missing === 0}
        inList={!compact && r.missingInList}
      />
    </Link>
  );
}
