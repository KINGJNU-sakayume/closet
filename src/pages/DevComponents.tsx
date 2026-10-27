import { useState } from 'react';
import { useGarments, useLookResults, useOutfits } from '../db/hooks';
import { sortLooks } from '../domain/matching';
import { Button, ButtonLink } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { Page } from '../components/Page';
import { ProgressBar } from '../components/ProgressBar';
import { Segmented } from '../components/Segmented';
import styles from './DevComponents.module.css';

// 개발용: 공통 컴포넌트를 한 화면에서 확인한다. 탭·링크에는 노출하지 않는다.
export function DevComponents() {
  const [sort, setSort] = useState<'reco' | 'mine'>('mine');
  const [onlyMine, setOnlyMine] = useState(false);
  return (
    <Page width="wide" title="공통 컴포넌트">
      <section className={styles.row}>
        <Button>구매하러 가기</Button>
        <ButtonLink to="/register" variant="pill">
          <Icon name="plus" size={14} strokeWidth={2.4} />옷 등록
        </ButtonLink>
        <Button variant="text">
          <Icon name="hanger" />입혀보기
        </Button>
        <Button variant="text" accent>
          <Icon name="plus" size={14} />쇼핑 리스트에 담기
        </Button>
        <IconButton icon="chevronLeft" aria-label="패널 접기" />
        <IconButton icon="close" aria-label="지우기" />
      </section>
      <section className={styles.row}>
        <Segmented
          label="정렬"
          value={sort}
          onChange={setSort}
          options={[
            { value: 'mine', label: '내 옷 많은 순' },
            { value: 'reco', label: '추천순' },
          ]}
        />
        <Checkbox checked={onlyMine} onChange={setOnlyMine}>
          내 옷으로 완성 가능한 룩만
        </Checkbox>
      </section>
      <section className={styles.bars}>
        <ProgressBar own={4} total={4} aside="내 옷으로 완성" asideAccent />
        <ProgressBar own={3} total={4} aside="1벌 부족" inList />
        <ProgressBar own={1} total={4} aside="3벌 부족" />
      </section>
      <DataCheck />
    </Page>
  );
}

const verdictLabel = { own: '✓ 있음', alt: '≈ 대체 가능', none: '없음' } as const;

// 2단계 확인용: 저장소의 예시 데이터에 판정 규칙을 돌린 결과('내 옷 많은 순').
function DataCheck() {
  const results = useLookResults();
  const garments = useGarments();
  const outfits = useOutfits();
  if (!results || !garments || !outfits) return null;
  return (
    <section className={styles.data}>
      <h2 className={styles.h2}>
        예시 데이터 · 내 옷 {garments.length}벌 · 코디 {outfits.length}개
      </h2>
      {sortLooks(results, 'mine').map((r) => (
        <div key={r.look.id} className={styles.look}>
          <h3 className={styles.h3}>{r.look.title}</h3>
          <ProgressBar
            own={r.own}
            total={r.total}
            aside={r.missing.length ? `${r.missing.length}벌 부족` : '내 옷으로 완성'}
            asideAccent={!r.missing.length}
            inList={r.missingInList}
          />
          <ul className={styles.items}>
            {r.items.map((i) => (
              <li key={i.product.id}>
                {i.product.alias} <strong data-verdict={i.verdict}>{verdictLabel[i.verdict]}</strong>
                {i.verdict === 'alt' && i.garment && <span> → 내 {i.garment.alias} ({i.score})</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
