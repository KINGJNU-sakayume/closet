import { createContext, useContext } from 'react';

/** 검색 패널 열기. 데스크톱은 헤더 검색창(anchor) 자리에서, 모바일은 전체 화면으로 */
export const SearchContext = createContext<(anchor?: HTMLElement) => void>(() => {});
export const useOpenSearch = () => useContext(SearchContext);
