import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { setWorn } from '../../db/actions';
import { useOutfits } from '../../db/hooks';
import { useIsMobile, useMediaQuery } from '../../hooks/useMediaQuery';
import { ClosetPanel } from './ClosetPanel';
import { LookPanel } from './LookPanel';
import { useFitting } from './useFitting';
import { SaveOutfit, WornPanel } from './WornPanel';
import styles from './Fitting.module.css';

const LAST_LOOK = 'closet:last-look';
const PANELS = 'closet:fitting-panels';

// 브라우저별 편의 상태(패널 접힘, 마지막으로 본 룩)는 localStorage에 둔다. 막혀 있어도 화면은 동작한다.
const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, v: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* 저장 못 해도 괜찮다 */
  }
};

export function Fitting() {
  const params = useParams();
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const lookId = params.lookId ?? read<string | undefined>(LAST_LOOK, undefined);
  const fit = useFitting(lookId);
  const outfits = useOutfits();
  const isMobile = useIsMobile();
  const narrow = useMediaQuery('(max-width: 1279.98px)');

  useEffect(() => {
    if (params.lookId) write(LAST_LOOK, params.lookId);
  }, [params.lookId]);

  // 저장한 코디 열기: /fitting?outfit=o_…
  const outfitId = search.get('outfit');
  useEffect(() => {
    if (!outfitId || !outfits) return;
    const o = outfits.find((x) => x.id === outfitId);
    if (o) void setWorn(o.slots);
    search.delete('outfit');
    setSearch(search, { replace: true });
  }, [outfitId, outfits, search, setSearch]);

  // 없는 룩 주소면 룩 없이 연다
  useEffect(() => {
    if (params.lookId && fit.looks && !fit.looks.some((l) => l.id === params.lookId)) navigate('/fitting', { replace: true });
  }, [params.lookId, fit.looks, navigate]);

  const [panels, setPanels] = useState(() => read(PANELS, { left: true, right: true }));
  // 1280px 미만에서는 룩 상세를 접어서 시작한다(이 화면 너비에서만 기억)
  const [rightNarrow, setRightNarrow] = useState(false);
  const leftOpen = panels.left;
  const rightOpen = narrow ? rightNarrow : panels.right;
  const toggle = (side: 'left' | 'right') => {
    if (side === 'right' && narrow) return setRightNarrow((v) => !v);
    const next = { ...panels, [side]: !panels[side] };
    setPanels(next);
    write(PANELS, next);
  };

  if (!fit.ready) return <main className={styles.loading} aria-busy="true" />;

  if (isMobile) return <MobileFitting fit={fit} />;

  const ownedText = fit.result ? ` · ${fit.result.own}/${fit.result.total}` : '';

  return (
    <main className={styles.main}>
      <h1 className="visually-hidden">피팅룸</h1>
      {leftOpen ? (
        <aside className={styles.left} aria-label="내 옷장">
          <ClosetPanel fit={fit} onCollapse={() => toggle('left')} />
        </aside>
      ) : (
        <aside className={[styles.rail, styles.railLeft].join(' ')} aria-label="내 옷장 (접힘)">
          <IconButton icon="chevronRight" aria-label="내 옷장 펼치기" onClick={() => toggle('left')} />
          <span className={styles.railText}>내 옷장</span>
        </aside>
      )}

      <section className={styles.center} aria-labelledby="fitting-title">
        <div className={styles.centerHead}>
          <div>
            <h2 id="fitting-title" className={styles.h2}>
              피팅룸
            </h2>
            <p className={styles.sub}>입혀 놓은 옷이 곧 장바구니예요</p>
          </div>
          {fit.result && (
            <Button variant="text" onClick={fit.wearLook} className={styles.wearLook}>
              <Icon name="hanger" />이 룩 그대로 입혀보기
            </Button>
          )}
        </div>
        <Avatar items={fit.items} onDrop={fit.wearDragged} />
        <WornPanel fit={fit} />
      </section>

      {rightOpen ? (
        <section className={styles.right} aria-label="룩 상세">
          <LookPanel fit={fit} onCollapse={() => toggle('right')} />
        </section>
      ) : (
        <aside className={[styles.rail, styles.railRight].join(' ')} aria-label="룩 상세 (접힘)">
          <IconButton icon="chevronLeft" aria-label="룩 상세 펼치기" onClick={() => toggle('right')} />
          <span className={styles.railText}>룩 상세{ownedText}</span>
        </aside>
      )}
    </main>
  );
}

type SheetTab = 'closet' | 'look';

// 모바일: 아바타가 위, 내 옷장·룩 상세는 아래 바텀 시트(중간 256px / 큰 560px)
function MobileFitting({ fit }: { fit: ReturnType<typeof useFitting> }) {
  const [tab, setTab] = useState<SheetTab>('closet');
  const [tall, setTall] = useState(false);
  const pick = (t: SheetTab) => {
    setTab(t);
    if (t === 'look') setTall(true);
  };
  const r = fit.result;
  const tabs: { value: SheetTab; label: string; count: string }[] = [
    { value: 'closet', label: '내 옷장', count: `${fit.garments?.length ?? 0}벌` },
    { value: 'look', label: '룩 상세', count: r ? `${r.own}/${r.total}` : '' },
  ];
  return (
    <main className={styles.mMain}>
      <section className={styles.band} aria-label="아바타">
        {r && (
          <Button variant="text" onClick={fit.wearLook} className={styles.mWearLook}>
            <Icon name="hanger" />룩 그대로 입기
          </Button>
        )}
        <div className={styles.mAvatar}>
          <Avatar items={fit.items} compact />
        </div>
      </section>
      <section className={[styles.sheet, tall && styles.sheetTall].filter(Boolean).join(' ')} aria-label="내 옷장과 룩 상세">
        <button type="button" className={styles.grabber} aria-label={tall ? '시트 작게 보기' : '시트 크게 보기'} aria-expanded={tall} onClick={() => setTall((v) => !v)}>
          <span />
        </button>
        <div role="tablist" aria-label="시트 내용" className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={`tab-${t.value}`}
              aria-selected={tab === t.value}
              aria-controls={`panel-${t.value}`}
              className={[styles.tab, tab === t.value && styles.tabOn].filter(Boolean).join(' ')}
              onClick={() => pick(t.value)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className={styles.tabPanel}>
          {tab === 'closet' ? (
            <>
              <ClosetPanel fit={fit} mobile />
              <div className={styles.mSave}>
                <SaveOutfit fit={fit} />
              </div>
            </>
          ) : (
            <LookPanel fit={fit} mobile />
          )}
        </div>
      </section>
    </main>
  );
}
