// 아바타 합성 배치. 무대(320×480, 2:3) 대비 백분율. 옷마다 미세 조정할 수 있게 한 파일에 모은다.
// 바닥에 펼쳐 찍은 사진은 입었을 때보다 옆으로 퍼져 있어 아우터와 하의는 가로를 줄여 늘려 맞춘다.
export interface Placement {
  left: number;
  top: number;
  width: number;
  /** 비우면 사진 비율대로 */
  height?: number;
  z: number;
}

export const PHOTO_PLACEMENT = {
  outer: { left: 19.75, top: 12.9, width: 61, height: 39.8, z: 4 },
  topLayered: { left: 20.9, top: 15.2, width: 61.9, z: 3 },
  topAlone: { left: 20.9, top: 16.7, width: 61.9, z: 3 },
  bottom: { left: 25.5, top: 38.3, width: 47.8, height: 55.4, z: 1 },
} satisfies Record<string, Placement>;

/** 신발은 사진 대신 항상 SVG(정면 두 발) */
export const SHOES_Z = 2;

/** '쇼핑몰 상품 / 아직 없는 옷' 설명의 세로 위치(%) */
export const SHOP_LABEL_TOP = { outer: 22, top: 34, bottom: 62, shoes: 88 } as const;
