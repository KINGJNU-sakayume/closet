import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return match;
}

/** 768px 미만이면 모바일 배치 */
export const useIsMobile = () => useMediaQuery('(max-width: 767.98px)');
