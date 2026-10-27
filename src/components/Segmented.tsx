import styles from './Segmented.module.css';

// 하나 고르기: 글자만, 선택된 항목에 2px 밑줄 + 굵게.
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  /** 색 고르기처럼 글자 앞에 동그란 색 견본을 붙일 때 */
  swatch?: string;
}

interface Props<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** tabs: role=tablist + aria-selected, buttons: aria-pressed */
  mode?: 'tabs' | 'buttons';
  size?: 'sm' | 'md' | 'lg';
  /** 모바일 가로 목록: 줄바꿈 없이 손가락으로 밀어 넘김 */
  scroll?: boolean;
}

export function Segmented<T extends string>({ options, value, onChange, label, mode = 'buttons', size = 'md', scroll }: Props<T>) {
  const isTabs = mode === 'tabs';
  return (
    <div role={isTabs ? 'tablist' : 'group'} aria-label={label} className={[styles.group, styles[size], scroll && styles.scroll].filter(Boolean).join(' ')}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role={isTabs ? 'tab' : undefined}
            aria-selected={isTabs ? on : undefined}
            aria-pressed={isTabs ? undefined : on}
            className={[styles.option, on && styles.on].filter(Boolean).join(' ')}
            onClick={() => onChange(o.value)}
          >
            {o.swatch && <span className={styles.swatch} style={{ background: o.swatch }} aria-hidden="true" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
