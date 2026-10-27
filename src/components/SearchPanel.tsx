import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGarments, useLooks } from '../db/hooks';
import { SEASONS, SITUATIONS, suggest, wagwa } from '../domain/search';
import { useDialog } from '../hooks/useDialog';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { Checkbox } from './Checkbox';
import { GarmentThumb } from './GarmentThumb';
import { Icon } from './Icon';
import { IconButton } from './IconButton';
import styles from './SearchPanel.module.css';

interface Props {
  /** 데스크톱: 헤더 검색창 자리(입력칸을 같은 곳에 띄운다). 비우면 모바일 전체 화면 */
  anchor?: DOMRect;
  initialMine: boolean;
  onClose: () => void;
}

export const exploreUrl = (params: { q?: string; with?: string; mine?: boolean }) => {
  const s = new URLSearchParams();
  if (params.q) s.set('q', params.q);
  if (params.with) s.set('with', params.with);
  if (params.mine) s.set('mine', '1');
  const qs = s.toString();
  return `/explore${qs ? `?${qs}` : ''}`;
};

// 검색 패널: 최근 검색, 내 옷으로 찾기, 상황·계절. 글자를 치면 자동완성으로 바뀐다.
export function SearchPanel({ anchor, initialMine, onClose }: Props) {
  const [q, setQ] = useState('');
  const [mine, setMine] = useState(initialMine);
  const recent = useRecentSearches();
  const looks = useLooks() ?? [];
  const garments = useGarments() ?? [];
  const navigate = useNavigate();
  const ref = useDialog<HTMLDivElement>(true, onClose, (): HTMLElement | null => document.getElementById('search-q'));
  const mobile = !anchor;
  const typing = q.trim().length > 0;
  const suggestions = suggest(q, looks);

  const go = (text: string) => {
    const t = text.trim();
    if (t) recent.add(t);
    onClose();
    navigate(exploreUrl({ q: t, mine }));
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    go(q);
  };

  const input = (
    <form role="search" onSubmit={submit} className={mobile ? styles.mForm : styles.form} style={anchor && { left: anchor.left, top: anchor.top, width: anchor.width, height: anchor.height }}>
      <Icon name="search" />
      <label htmlFor="search-q" className="visually-hidden">
        룩 검색
      </label>
      <input
        id="search-q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="룩 검색 · 예: 가을 남자 코트 코디"
        autoComplete="off"
        enterKeyHint="search"
        className={styles.input}
      />
    </form>
  );

  const body = (
    <>
      <div className={styles.top}>
        <Checkbox checked={mine} onChange={setMine}>
          내 옷으로 완성할 수 있는 룩만 보기
        </Checkbox>
        {!mobile && <IconButton icon="close" aria-label="검색 닫기" onClick={onClose} />}
      </div>

      {typing ? (
        <div className={styles.suggest}>
          {suggestions.map((s) => (
            <button key={s.text} type="button" className={styles.suggestRow} onClick={() => go(s.text)}>
              <Icon name="search" size={16} />
              <span>
                {s.pre}
                <strong>{s.hit}</strong>
                {s.post}
              </span>
            </button>
          ))}
          {suggestions.length === 0 && <p className={styles.muted}>추천어가 없어요. 이대로 검색하면 룩 이름과 아이템에서 찾아요.</p>}
        </div>
      ) : (
        <div className={styles.idle}>
          <section className={styles.block}>
            <div className={styles.blockHead}>
              <h2 className={styles.h2}>최근 검색</h2>
              {recent.list.length > 0 && (
                <button type="button" className={styles.clear} onClick={recent.clear}>
                  전체 지우기
                </button>
              )}
            </div>
            <div className={styles.recent}>
              {recent.list.map((r) => (
                <span key={r} className={styles.recentItem}>
                  <button type="button" className={styles.recentLink} onClick={() => go(r)}>
                    {r}
                  </button>
                  <IconButton icon="close" size={14} aria-label={`${r} 검색 기록 지우기`} className={styles.recentX} onClick={() => recent.remove(r)} />
                </span>
              ))}
              {recent.list.length === 0 && <span className={styles.muted}>최근 검색이 없어요.</span>}
            </div>
          </section>

          {garments.length > 0 && (
            <section className={styles.block}>
              <div>
                <h2 className={styles.h2}>내 옷으로 찾기</h2>
                <p className={styles.sub}>이 옷을 어떻게 입을지 모르겠다면, 골라서 어울리는 룩을 찾아요.</p>
              </div>
              <div className={styles.mine}>
                {garments.slice(0, 6).map((g) => (
                  <Link key={g.id} to={exploreUrl({ with: g.id, mine })} onClick={onClose} className={styles.mineItem} aria-label={`${wagwa(g.alias)} 어울리는 룩 찾기`}>
                    <span className={styles.mineThumb}>
                      <GarmentThumb image={g.cutout} category={g.attrs.category} colorHex={g.colorHex} alt="" inset={g.cutout ? 10 : 20} />
                    </span>
                    <span>{g.alias}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className={styles.block}>
            <h2 className={styles.h2}>상황과 계절로 찾기</h2>
            {[
              ['상황', SITUATIONS],
              ['계절', SEASONS],
            ].map(([label, words]) => (
              <div key={label as string} className={styles.tagRow}>
                <span className={styles.tagLabel}>{label}</span>
                {(words as string[]).map((w) => (
                  <button key={w} type="button" className={styles.tag} onClick={() => go(w)}>
                    {w}
                  </button>
                ))}
              </div>
            ))}
          </section>
        </div>
      )}
    </>
  );

  if (mobile) {
    return (
      <div ref={ref} role="dialog" aria-modal="true" aria-label="룩 검색" className={styles.mobile}>
        <div className={styles.mTop}>
          {input}
          <button type="button" className={styles.cancel} onClick={onClose}>
            취소
          </button>
        </div>
        <div className={styles.mBody}>{body}</div>
      </div>
    );
  }

  return (
    <div ref={ref} role="dialog" aria-modal="true" aria-label="룩 검색" className={styles.root}>
      <div className={styles.scrim} style={{ top: anchor.bottom + 14 }} onClick={onClose} />
      {input}
      <div className={styles.panel} style={{ top: anchor.bottom + 14 + 12 }}>
        {body}
      </div>
    </div>
  );
}
