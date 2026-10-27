import { useCallback, useState } from 'react';
import { Outlet, useMatches, useSearchParams } from 'react-router-dom';
import { useShoppingCount } from '../db/hooks';
import { useIsMobile } from '../hooks/useMediaQuery';
import { Header, LandingHeader } from './Header';
import { MobileLandingBar, MobileTopBar } from './MobileTopBar';
import { SearchPanel } from './SearchPanel';
import { SearchContext } from './searchContext';
import { TabBar } from './TabBar';
import styles from './AppLayout.module.css';

export interface RouteHandle {
  title: string;
  /** landing: 랜딩 헤더, 모바일 탭 바 없음 · modal: 모바일에서 탭 바를 숨긴 전체 화면 */
  chrome?: 'app' | 'landing' | 'modal';
}

export function AppLayout() {
  const matches = useMatches();
  const [params] = useSearchParams();
  const handle = (matches[matches.length - 1]?.handle ?? { title: '' }) as RouteHandle;
  const chrome = handle.chrome ?? 'app';
  const count = useShoppingCount();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState<{ anchor?: DOMRect } | null>(null);
  const openSearch = useCallback((el?: HTMLElement) => setSearch({ anchor: isMobile ? undefined : el?.getBoundingClientRect() }), [isMobile]);
  const closeSearch = useCallback(() => setSearch(null), []);

  return (
    <SearchContext.Provider value={openSearch}>
      <div className={[styles.shell, chrome === 'app' && styles.withTabBar].filter(Boolean).join(' ')}>
        <div className={styles.desktop}>
          {chrome === 'landing' ? <LandingHeader /> : <Header shoppingCount={count} query={params.get('q') ?? undefined} onSearch={openSearch} />}
        </div>
        {chrome === 'app' && (
          <div className={styles.mobile}>
            <MobileTopBar title={handle.title} onSearch={openSearch} />
          </div>
        )}
        {chrome === 'landing' && (
          <div className={styles.mobile}>
            <MobileLandingBar />
          </div>
        )}
        <Outlet />
        {chrome === 'app' && (
          <div className={styles.mobile}>
            <TabBar shoppingCount={count} />
          </div>
        )}
        {search && <SearchPanel anchor={search.anchor} initialMine={params.get('mine') === '1'} onClose={closeSearch} />}
      </div>
    </SearchContext.Provider>
  );
}
