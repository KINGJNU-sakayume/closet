import { Link } from 'react-router-dom';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import styles from './MobileTopBar.module.css';

// 모바일 상단 바: 왼쪽 화면 제목, 오른쪽 검색 아이콘 + 옷 등록(검은 원 44px)
export function MobileTopBar({ title, onSearch }: { title: string; onSearch?: () => void }) {
  return (
    <header className={styles.bar}>
      <h1 className={styles.title}>{title}</h1>
      <IconButton icon="search" size={22} aria-label="검색" onClick={onSearch} />
      <Link to="/register" aria-label="옷 등록" className={styles.add}>
        <Icon name="plus" size={20} strokeWidth={2.2} />
      </Link>
    </header>
  );
}

// 모바일 랜딩 상단 바: 로고 + 룩 둘러보기
export function MobileLandingBar() {
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.logo}>
        Closet / Look
      </Link>
      <Link to="/explore" className={styles.textLink}>
        룩 둘러보기
      </Link>
    </header>
  );
}

// 전체 화면 모달 상단 바: 취소 · 제목 · N / 3 + 2px 진행 막대
export function ModalTopBar({ title, step, total, cancelTo }: { title: string; step: number; total: number; cancelTo: string }) {
  return (
    <>
      <header className={[styles.bar, styles.modal].join(' ')}>
        <Link to={cancelTo} className={styles.cancel}>
          취소
        </Link>
        <h1 className={styles.modalTitle}>{title}</h1>
        <span className={styles.step} aria-current="step">
          {step} / {total}
        </span>
      </header>
      <div className={styles.progress} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </>
  );
}
