import { useEffect, useState } from 'react';
import type { Category } from '../domain/types';
import styles from './GarmentThumb.module.css';

// 사진이 없는 옷의 모양(100×100). 시안 룩 카드의 경로 그대로.
const shapes: Partial<Record<Category, string>> = {
  outer: 'M28 10 L8 24 L14 66 L26 64 L26 92 L74 92 L74 64 L86 66 L92 24 L72 10 Q50 22 28 10Z',
  top: 'M30 12 L10 26 L18 46 L30 40 L30 90 L70 90 L70 40 L82 46 L90 26 L70 12 Q50 24 30 12Z',
  bottom: 'M28 6 L72 6 L78 96 L56 96 L50 34 L44 96 L22 96Z',
  shoes: 'M6 52 L34 48 L44 58 L90 60 Q96 62 94 74 L6 74Z',
};

/** Blob을 object URL로 바꿔 쓰고, 다 쓰면 놓아준다. */
export function useObjectUrl(blob?: Blob): string | undefined {
  const [url, setUrl] = useState<string>();
  useEffect(() => {
    if (!blob) return setUrl(undefined);
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

interface Props {
  image?: Blob | string;
  category: Category;
  colorHex?: string;
  alt: string;
  /** 이미지 둘레 여백(%) */
  inset?: number;
}

// 옷 한 벌의 그림: 배경을 지운 사진이 있으면 사진, 없으면 종류별 모양에 옷 색을 칠한다.
export function GarmentThumb({ image, category, colorHex, alt, inset = 8 }: Props) {
  const blobUrl = useObjectUrl(typeof image === 'string' ? undefined : image);
  const src = typeof image === 'string' ? image : blobUrl;
  if (src) return <img src={src} alt={alt} className={styles.img} style={{ padding: `${inset}%` }} />;
  return (
    // alt가 비면 장식용(옆에 이름 글자가 있음): 화면 낭독기에서 숨긴다
    <svg {...(alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true })} viewBox="0 0 100 100" className={styles.shape} style={{ padding: `${inset}%` }}>
      <path d={shapes[category] ?? shapes.top} fill={colorHex ?? 'var(--line)'} stroke="var(--line-input)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
