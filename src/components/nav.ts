import type { IconName } from './Icon';

export interface Tab {
  to: string;
  label: string;
  icon: IconName;
  match: string;
}

// 탭 4개. 데스크톱 헤더와 모바일 탭 바가 같이 쓴다.
export const tabs: Tab[] = [
  { to: '/explore', label: '룩 탐색', icon: 'explore', match: '/explore' },
  { to: '/fitting', label: '피팅룸', icon: 'hanger', match: '/fitting' },
  { to: '/closet', label: '내 옷장', icon: 'closet', match: '/closet' },
  { to: '/shopping', label: '쇼핑 리스트', icon: 'bag', match: '/shopping' },
];

export const shoppingLabel = (count: number) => `쇼핑 리스트, ${count}벌`;
