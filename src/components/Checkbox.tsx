import type { InputHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import styles from './Checkbox.module.css';

// 여러 개 고르기·켜고 끄기: 18px 네모, 켜지면 강조색 바탕 + 흰 체크.
interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}

export function Checkbox({ checked, onChange, children, className, ...rest }: Props) {
  return (
    <label className={[styles.label, className].filter(Boolean).join(' ')}>
      <input type="checkbox" className={styles.input} checked={checked} onChange={(e) => onChange(e.target.checked)} {...rest} />
      <span className={styles.box} aria-hidden="true">
        {checked && <Icon name="check" size={12} strokeWidth={3.2} />}
      </span>
      {children}
    </label>
  );
}
