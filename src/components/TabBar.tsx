import { NavLink } from 'react-router-dom';
import { Icon } from './Icon';
import { shoppingLabel, tabs } from './nav';
import styles from './TabBar.module.css';

// 모바일 하단 탭 바: 아이콘 24 + 라벨 11, 56px + 안전 영역
export function TabBar({ shoppingCount }: { shoppingCount: number }) {
  return (
    <nav aria-label="주 메뉴" className={styles.bar}>
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) => [styles.tab, isActive && styles.active].filter(Boolean).join(' ')}
          aria-label={t.to === '/shopping' ? shoppingLabel(shoppingCount) : undefined}
        >
          {({ isActive }) => (
            <>
              <Icon name={t.icon} size={24} strokeWidth={isActive ? 2 : 1.6} />
              {t.label}
              {t.to === '/shopping' && <span className={styles.count}>{shoppingCount}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
