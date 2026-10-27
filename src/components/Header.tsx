import { Link, NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { ButtonLink } from './Button';
import { shoppingLabel, tabs } from './nav';
import styles from './Header.module.css';

interface Props {
  shoppingCount: number;
  query?: string;
  onSearch?: () => void;
}

// 데스크톱 공통 헤더: 로고 · 검색창 · 탭 4개 · + 옷 등록
export function Header({ shoppingCount, query, onSearch }: Props) {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        Closet / Look
      </Link>
      <button type="button" className={styles.search} onClick={onSearch} aria-haspopup="dialog">
        <span className={styles.searchIcon}>
          <Icon name="search" />
        </span>
        {query ? <span>{query}</span> : <span className={styles.placeholder}>룩 검색 · 예: 가을 남자 코트 코디</span>}
      </button>
      <nav aria-label="주 메뉴" className={styles.nav}>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => [styles.tab, isActive && styles.active].filter(Boolean).join(' ')}
            aria-label={t.to === '/shopping' ? shoppingLabel(shoppingCount) : undefined}
          >
            {t.label}
            {t.to === '/shopping' && <span className={styles.count}>{shoppingCount}</span>}
          </NavLink>
        ))}
      </nav>
      <ButtonLink to="/register" variant="pill">
        <Icon name="plus" size={14} strokeWidth={2.4} />옷 등록
      </ButtonLink>
    </header>
  );
}

// 랜딩 헤더: 로고 · 룩 둘러보기 · 피팅룸 · 내 옷장 만들기
export function LandingHeader() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        Closet / Look
      </Link>
      <nav aria-label="주 메뉴" className={[styles.nav, styles.landingNav].join(' ')}>
        <Link to="/explore" className={styles.landingLink}>
          룩 둘러보기
        </Link>
        <Link to="/fitting" className={styles.landingLink}>
          피팅룸
        </Link>
      </nav>
      <ButtonLink to="/register" variant="pill">
        내 옷장 만들기
      </ButtonLink>
    </header>
  );
}
