import { useEffect, useState, type ReactNode } from 'react';
import { db } from './db';
import { initData } from './seed';

// 저장소 준비(첫 실행 예시 데이터, ?reset=1 / ?empty=1)가 끝난 뒤 앱을 그린다.
export function DataGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'ready' | Error>('loading');

  useEffect(() => {
    initData(db, window.location.search)
      .then((result) => {
        if (result === 'reset' || result === 'empty') {
          // 새로고침할 때마다 다시 지워지지 않도록 개발용 파라미터를 주소에서 뺀다.
          const url = new URL(window.location.href);
          url.searchParams.delete('reset');
          url.searchParams.delete('empty');
          window.history.replaceState(window.history.state, '', url);
        }
        setState('ready');
      })
      .catch((e: unknown) => setState(e instanceof Error ? e : new Error(String(e))));
  }, []);

  if (state === 'loading') return null;
  if (state instanceof Error) return <p role="alert">저장소를 열지 못했어요. 브라우저의 사이트 데이터 설정을 확인해 주세요.</p>;
  return <>{children}</>;
}
