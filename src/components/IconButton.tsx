import type { ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';
import styles from './IconButton.module.css';

// 테두리·동그라미 없이 기호만. aria-label은 필수.
interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label' | 'children'> {
  icon: IconName;
  'aria-label': string;
  size?: number;
}

export function IconButton({ icon, size = 18, className, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={[styles.button, className].filter(Boolean).join(' ')} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
}
