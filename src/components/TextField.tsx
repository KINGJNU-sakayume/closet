import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './TextField.module.css';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: ReactNode;
  hint?: ReactNode;
}

// 입력칸: 테두리 --line-input, 모서리 8px. 모바일은 글자 16px·높이 48px(iOS 확대 방지).
export function TextField({ label, hint, className, ...rest }: Props) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input id={id} aria-describedby={hintId} className={styles.input} {...rest} />
      {hint && (
        <div id={hintId} className={styles.hint}>
          {hint}
        </div>
      )}
    </div>
  );
}

export const Optional = ({ children = '(선택)' }: { children?: ReactNode }) => <span className={styles.optional}>{children}</span>;
