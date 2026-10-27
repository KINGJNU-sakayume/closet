import { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ButtonLink } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { Icon } from '../../components/Icon';
import { LookCard } from '../../components/LookCard';
import { useOpenSearch } from '../../components/searchContext';
import { Segmented } from '../../components/Segmented';
import { SortSheet } from '../../components/SortSheet';
import { useGarments, useLookResults } from '../../db/hooks';
import { sortLooks, type LookSort } from '../../domain/matching';
import { isComplete, matchesQuery, usesGarment, wagwa } from '../../domain/search';
import { useIsMobile } from '../../hooks/useMediaQuery';
import styles from './Explore.module.css';

const SORTS: { value: LookSort; label: string }[] = [
  { value: 'mine', label: '내 옷 많은 순' },
  { value: 'reco', label: '추천순' },
];

// 룩 탐색: 태그 검색 결과 카드 그리드. 정렬·'내 옷으로 완성 가능한 룩만'은 주소에 남긴다.
export function Explore() {
  const [params, setParams] = useSearchParams();
  const results = useLookResults();
  const garments = useGarments();
  const isMobile = useIsMobile();
  const openSearch = useOpenSearch();
  const [sheet, setSheet] = useState(false);
  const sortButton = useRef<HTMLButtonElement>(null);

  const q = params.get('q') ?? '';
  const withId = params.get('with');
  const onlyMine = params.get('mine') === '1';
  // 시안 기본값: 데스크톱은 내 옷 많은 순, 모바일은 추천순
  const sort = (params.get('sort') as LookSort | null) ?? (isMobile ? 'reco' : 'mine');

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  if (!results || !garments) return <main className={styles.page} aria-busy="true" />;

  const withGarment = withId ? garments.find((g) => g.id === withId) : undefined;
  const matched = results.filter((r) => (withId ? usesGarment(r, withId) : matchesQuery(r.look, q)));
  const shown = sortLooks(
    matched.filter((r) => !onlyMine || isComplete(r)),
    sort,
  );
  const title = withGarment ? `${wagwa(withGarment.alias)} 어울리는 룩` : q || '전체 룩';
  const summary = `룩 ${shown.length}개 · 내 옷장 ${garments.length}벌과 비교${isMobile ? '' : '했어요'}`;
  const sortLabel = SORTS.find((s) => s.value === sort)!.label;

  const checkbox = (
    <Checkbox checked={onlyMine} onChange={(on) => set('mine', on ? '1' : null)} className={isMobile ? styles.mCheck : undefined}>
      내 옷으로 완성 가능한 룩만
    </Checkbox>
  );

  const empty =
    shown.length === 0 &&
    (onlyMine || matched.length > 0 ? (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>내 옷만으로 완성되는 룩이 아직 없어요</h2>
        <p className={styles.emptySub}>옷을 몇 벌 더 등록하면 결과가 늘어나요.</p>
        <ButtonLink to="/register">옷 등록하기</ButtonLink>
      </div>
    ) : (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>‘{q}’에 맞는 룩이 없어요</h2>
        <p className={styles.emptySub}>다른 말로 찾거나 전체 룩을 둘러보세요.</p>
        <ButtonLink to="/explore">전체 룩 보기</ButtonLink>
      </div>
    ));

  const grid = shown.length > 0 && (
    <div className={styles.grid}>
      {shown.map((r) => (
        <LookCard key={r.look.id} result={r} compact={isMobile} />
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <main className={styles.mPage}>
        <div className={styles.mControls}>
          <button type="button" className={styles.mSearch} onClick={() => openSearch()} aria-haspopup="dialog">
            <Icon name="search" />
            <span className={q ? undefined : styles.placeholder}>{q || '룩 검색 · 예: 가을 남자 코트 코디'}</span>
          </button>
          <div className={styles.mRow}>
            {checkbox}
            <button ref={sortButton} type="button" className={styles.sortButton} aria-haspopup="dialog" onClick={() => setSheet(true)}>
              {sortLabel}
              <Icon name="chevronDown" size={16} />
            </button>
          </div>
        </div>
        {withGarment && <h2 className={styles.mTitle}>{title}</h2>}
        <p className={styles.summary}>{summary}</p>
        {grid}
        {empty}
        <SortSheet open={sheet} title="정렬" options={[SORTS[1], SORTS[0]]} value={sort} onChange={(v) => set('sort', v)} onClose={() => setSheet(false)} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.summary}>{summary}</p>
        </div>
        <div className={styles.controls}>
          {checkbox}
          <Segmented label="정렬" value={sort} onChange={(v) => set('sort', v)} options={SORTS} />
        </div>
      </div>
      {grid}
      {empty}
    </main>
  );
}
