import type { Verdict as V } from '../domain/matching';
import { Icon } from './Icon';
import styles from './Verdict.module.css';

// 판정 상태: 배경 없는 굵은 글자. 색만으로 구분하지 않고 글자로도 구분한다.
export function Verdict({ verdict, size = 'md' }: { verdict: V; size?: 'sm' | 'md' }) {
  return (
    <span className={[styles.verdict, styles[verdict], styles[size]].join(' ')}>
      {verdict === 'own' && (
        <>
          <Icon name="check" size={14} strokeWidth={2.4} />
          있음
        </>
      )}
      {verdict === 'alt' && '≈ 대체 가능'}
      {verdict === 'none' && '없음'}
    </span>
  );
}
