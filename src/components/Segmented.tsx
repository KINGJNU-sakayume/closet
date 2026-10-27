import styles from './Segmented.module.css';

// 하나 고르기: 글자만, 선택된 항목에 2px 밑줄 + 굵게.
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** tabs: role=tablist + aria-selected, buttons: aria-pressed */
  mode?: 'tabs' | 'buttons';
  size?: 'md' | 'lg';
}

export function Segmented<T extends string>({ options, value, onChange, label, mode = 'buttons', size = 'md' }: Props<T>) {
  const isTabs = mode === 'tabs';
  return (
    <div role={isTabs ? 'tablist' : 'group'} aria-label={label} className={[styles.group, styles[size]].join(' ')}>
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
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
