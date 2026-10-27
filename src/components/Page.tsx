import type { ReactNode } from 'react';
import styles from './Page.module.css';

type Width = 'landing' | 'wide' | 'narrow' | 'full';

// 화면 본문 컨테이너. 최대 폭과 좌우 여백만 정한다.
export function Page({ width = 'wide', title, children }: { width?: Width; title?: string; children?: ReactNode }) {
  return (
    <main className={[styles.page, styles[width]].join(' ')}>
      {title && <h1 className={styles.title}>{title}</h1>}
      {children}
    </main>
  );
}

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className={styles.empty}>
      <p>{children}</p>
      {action}
    </div>
  );
}
