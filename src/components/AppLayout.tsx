import { Outlet, useMatches, useSearchParams } from 'react-router-dom';
import { useShoppingCount } from '../db/hooks';
import { Header, LandingHeader } from './Header';
import { MobileLandingBar, MobileTopBar } from './MobileTopBar';
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
  // 검색 패널은 5단계에서 연결한다.
  const openSearch = undefined;

  return (
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
    </div>
  );
}
