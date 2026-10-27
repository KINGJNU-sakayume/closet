import { useCallback, useState } from 'react';

// 최근 검색은 이 브라우저의 편의 기능이라 localStorage에 둔다. 막혀 있으면 기억만 못 한다.
const KEY = 'closet:recent-searches';
const MAX = 8;

const load = (): string[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};
const save = (list: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* 저장 못 해도 검색은 된다 */
  }
};

export function useRecentSearches() {
  const [list, setList] = useState(load);
  const update = useCallback((next: string[]) => {
    setList(next);
    save(next);
  }, []);
  return {
    list,
    add: (q: string) => update([q, ...list.filter((x) => x !== q)].slice(0, MAX)),
    remove: (q: string) => update(list.filter((x) => x !== q)),
    clear: () => update([]),
  };
}
