import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

// primary: 검은 직사각형(화면당 1개) · pill: 헤더 핵심 버튼(화면당 1개) · text: 테두리 없는 보조 동작
export type ButtonVariant = 'primary' | 'pill' | 'text';

interface Common {
  variant?: ButtonVariant;
  accent?: boolean;
  block?: boolean;
  children: ReactNode;
}

function cx(variant: ButtonVariant, accent?: boolean, block?: boolean, extra?: string) {
  return [styles.base, styles[variant], accent && styles.accent, block && styles.block, extra].filter(Boolean).join(' ');
}

export function Button({ variant = 'primary', accent, block, className, type = 'button', ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cx(variant, accent, block, className)} {...rest} />;
}

export function ButtonLink({ variant = 'primary', accent, block, className, ...rest }: Common & LinkProps) {
  return <Link className={cx(variant, accent, block, className)} {...rest} />;
}

// 쇼핑몰 상품 페이지 같은 외부 링크는 새 탭으로 연다.
export function ButtonExternal({ variant = 'primary', accent, block, className, ...rest }: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a target="_blank" rel="noopener noreferrer" className={cx(variant, accent, block, className)} {...rest} />;
}
