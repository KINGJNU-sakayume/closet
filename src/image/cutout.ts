// 옷 사진 처리: 배경 제거(브라우저 안, @imgly/background-removal) → 옷 테두리에 맞게 자르기 → 평균색.
// 입히는 순간이 아니라 등록할 때 한 번만 돌린다.

/** 저장할 때 긴 변의 최대 길이. 아바타 무대(320×480)의 몇 배면 충분하다. */
const MAX_SIDE = 1200;
/** 이 값보다 불투명한 픽셀만 옷으로 본다 */
const ALPHA_MIN = 16;

export type CutoutProgress = (phase: 'download' | 'compute', ratio: number) => void;

export async function removeBackground(image: Blob, onProgress?: CutoutProgress): Promise<Blob> {
  const { removeBackground: run } = await import('@imgly/background-removal');
  return run(image, {
    // 모델 파일 약 44MB + 실행 파일 약 12MB를 처음 한 번 내려받는다(브라우저 캐시에 남음).
    model: 'isnet_quint8',
    output: { format: 'image/png' },
    progress: (key, current, total) => {
      if (!onProgress || !total) return;
      onProgress(key.startsWith('compute') ? 'compute' : 'download', current / total);
    },
  });
}

async function toCanvas(blob: Blob): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return { canvas, ctx };
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('이미지를 만들지 못했어요'))), 'image/png'));

export interface Trimmed {
  blob: Blob;
  /** 옷 픽셀의 평균색 */
  rgb: [number, number, number];
}

/** 투명 PNG를 옷 테두리에 맞게 자르고, 긴 변을 MAX_SIDE 이하로 줄인다. */
export async function trimToContent(cutout: Blob): Promise<Trimmed> {
  const { canvas, ctx } = await toCanvas(cutout);
  const { width: w, height: h } = canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < ALPHA_MIN) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }
  if (n === 0) throw new Error('사진에서 옷을 찾지 못했어요');

  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const scale = Math.min(1, MAX_SIDE / Math.max(cw, ch));
  const out = document.createElement('canvas');
  out.width = Math.round(cw * scale);
  out.height = Math.round(ch * scale);
  out.getContext('2d')!.drawImage(canvas, minX, minY, cw, ch, 0, 0, out.width, out.height);
  return { blob: await toBlob(out), rgb: [r / n, g / n, b / n] };
}

/** 원본 사진도 같은 기준으로 줄여 저장한다. */
export async function shrink(photo: Blob): Promise<Blob> {
  const { canvas } = await toCanvas(photo);
  const scale = Math.min(1, MAX_SIDE / Math.max(canvas.width, canvas.height));
  if (scale === 1 && photo.type === 'image/png') return photo;
  const out = document.createElement('canvas');
  out.width = Math.round(canvas.width * scale);
  out.height = Math.round(canvas.height * scale);
  out.getContext('2d')!.drawImage(canvas, 0, 0, out.width, out.height);
  return toBlob(out);
}
