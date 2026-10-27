// 지시서 '데이터 모델'. 상품(Product)과 내 옷(Garment)을 나눠 저장하고, 비교는 속성으로 한다.
export type Category = 'outer' | 'top' | 'bottom' | 'shoes' | 'bag' | 'hat' | 'acc';
export type Fit = 'slim' | 'regular' | 'oversized' | 'wide';
export type Length = 'cropped' | 'regular' | 'long';
export type Season = 'spring_fall' | 'summer' | 'winter';
export type Slot = 'outer' | 'top' | 'bottom' | 'shoes';

export interface Attributes {
  category: Category;
  colorFamily: string;
  fit?: Fit;
  length?: Length;
  seasons: Season[];
}

export interface Product {
  id: string;
  title: string;
  alias: string;
  shop: string;
  url?: string | null;
  price?: number | null;
  image?: string | null;
  /** 사진이 없을 때 옷 모양 SVG에 칠할 색 */
  colorHex?: string;
  attrs: Attributes;
}

export interface Garment {
  id: string;
  alias: string;
  sourceTitle?: string | null;
  /** '상품 링크로 등록'에서 남긴 상품 주소 */
  sourceUrl?: string;
  /** 배경을 지운 투명 PNG. 예시 데이터나 '샀어요'로 온 옷은 비어 있을 수 있다. */
  cutout?: Blob;
  original?: Blob;
  colorHex?: string;
  attrs: Attributes;
  fromProductId?: string;
  createdAt: string;
}

export interface Look {
  id: string;
  title: string;
  source: string;
  photo?: string | null;
  tags: string[];
  items: Product[];
}

export interface Outfit {
  id: string;
  title: string;
  slots: Partial<Record<Slot, { garmentId?: string; productId?: string }>>;
  createdAt: string;
}

export interface ShoppingItem {
  productId: string;
  addedAt: string;
  status: 'wanted' | 'bought' | 'removed';
}

/** 사용자 보정: '이미 비슷한 옷이 있어요'로 그 룩의 상품과 내 옷을 짝지은 기록 */
export interface MatchOverride {
  lookId: string;
  productId: string;
  garmentId: string;
}
