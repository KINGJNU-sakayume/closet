import { useDialog } from '../hooks/useDialog';
import { Icon } from './Icon';
import styles from './SortSheet.module.css';

interface Props<T extends string> {
  open: boolean;
  title: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  onClose: () => void;
}

// 모바일 정렬 시트: 아래에서 올라오는 선택지 + 체크, 오른쪽 위 '완료'. 한 번에 시트 하나만.
export function SortSheet<T extends string>({ open, title, options, value, onChange, onClose }: Props<T>) {
  const ref = useDialog<HTMLDivElement>(open, onClose);
  if (!open) return null;
  return (
    <div className={styles.scrim} onClick={onClose}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="sort-title" className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <span className={styles.grabber} aria-hidden="true" />
        <div className={styles.head}>
          <h2 id="sort-title" className={styles.title}>
            {title}
          </h2>
          <button type="button" className={styles.done} onClick={onClose}>
            완료
          </button>
        </div>
        <div role="radiogroup" aria-labelledby="sort-title">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={o.value === value}
              className={[styles.option, o.value === value && styles.on].filter(Boolean).join(' ')}
              onClick={() => {
                onChange(o.value);
                onClose();
              }}
            >
              {o.label}
              {o.value === value && <Icon name="check" size={18} strokeWidth={2.4} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
