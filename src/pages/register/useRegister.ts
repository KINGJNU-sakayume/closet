import { useCallback, useRef, useState } from 'react';
import { db } from '../../db/db';
import { colorHex, nearestColor, suggestAlias } from '../../domain/garmentOptions';
import type { Category, Fit, Garment, Season } from '../../domain/types';
import { removeBackground, shrink, trimToContent } from '../../image/cutout';

export type Step = 1 | 2 | 3;

export interface Draft {
  original?: Blob;
  cutout?: Blob;
  sourceUrl?: string;
  category: Category;
  color: string;
  /** 사용자가 색을 직접 골랐으면 사진 평균색으로 덮어쓰지 않는다 */
  colorPicked: boolean;
  fit: Fit;
  seasons: Season[];
  /** null이면 자동 제안, 사용자가 고치면 그 값으로 고정 */
  alias: string | null;
  sourceTitle: string;
}

export type Processing =
  | { state: 'idle' }
  | { state: 'working'; phase: 'download' | 'compute'; ratio: number }
  | { state: 'error'; message: string };

const emptyDraft = (): Draft => ({
  category: 'top',
  color: '화이트',
  colorPicked: false,
  fit: 'regular',
  seasons: ['spring_fall'],
  alias: null,
  sourceTitle: '',
});

export const aliasOf = (d: Draft) => d.alias ?? suggestAlias(d.category, d.color);

// 옷 등록 흐름: 1 사진(또는 상품 주소) → 2 정보 확인 → 3 완료
export function useRegister() {
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [processing, setProcessing] = useState<Processing>({ state: 'idle' });
  const [saved, setSaved] = useState<Garment>();
  const queue = useRef<Blob[]>([]);
  const run = useRef(0);

  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);

  const processPhoto = useCallback(async (photo: Blob) => {
    const id = ++run.current;
    setDraft((d) => ({ ...d, original: photo, cutout: undefined }));
    setProcessing({ state: 'working', phase: 'download', ratio: 0 });
    setStep(2);
    try {
      const raw = await removeBackground(photo, (phase, ratio) => {
        if (run.current === id) setProcessing({ state: 'working', phase, ratio });
      });
      const { blob, rgb } = await trimToContent(raw);
      const original = await shrink(photo);
      if (run.current !== id) return;
      setDraft((d) => ({ ...d, cutout: blob, original, color: d.colorPicked ? d.color : nearestColor(rgb) }));
      setProcessing({ state: 'idle' });
    } catch (e) {
      if (run.current !== id) return;
      setProcessing({ state: 'error', message: e instanceof Error ? e.message : String(e) });
    }
  }, []);

  /** 배경 제거가 안 될 때: 원본을 그대로 옷 사진으로 쓴다 */
  const keepOriginal = useCallback(async () => {
    if (!draft.original) return;
    const original = await shrink(draft.original);
    update({ cutout: original, original });
    setProcessing({ state: 'idle' });
  }, [draft.original, update]);

  const startWithFiles = useCallback(
    (files: Blob[]) => {
      const [first, ...rest] = files;
      if (!first) return;
      queue.current = rest;
      setDraft(emptyDraft());
      void processPhoto(first);
    },
    [processPhoto],
  );

  const startWithUrl = useCallback((url: string) => {
    queue.current = [];
    setDraft({ ...emptyDraft(), sourceUrl: url });
    setProcessing({ state: 'idle' });
    setStep(2);
  }, []);

  const restart = useCallback(() => {
    run.current++;
    queue.current = [];
    setDraft(emptyDraft());
    setProcessing({ state: 'idle' });
    setSaved(undefined);
    setStep(1);
  }, []);

  const save = useCallback(async () => {
    const garment: Garment = {
      id: `g_${crypto.randomUUID().slice(0, 8)}`,
      alias: aliasOf(draft).trim() || suggestAlias(draft.category, draft.color),
      sourceTitle: draft.sourceTitle.trim() || null,
      ...(draft.sourceUrl ? { sourceUrl: draft.sourceUrl } : {}),
      ...(draft.cutout ? { cutout: draft.cutout } : {}),
      ...(draft.original ? { original: draft.original } : {}),
      colorHex: colorHex(draft.color),
      attrs: { category: draft.category, colorFamily: draft.color, fit: draft.fit, seasons: draft.seasons },
      createdAt: new Date().toISOString(),
    };
    await db.garments.add(garment);
    setSaved(garment);
    setStep(3);
  }, [draft]);

  /** 한 벌 더: 함께 고른 사진이 남아 있으면 다음 사진으로, 아니면 1단계로 */
  const next = useCallback(() => {
    const [photo, ...rest] = queue.current;
    setSaved(undefined);
    if (!photo) return restart();
    queue.current = rest;
    setDraft(emptyDraft());
    void processPhoto(photo);
  }, [processPhoto, restart]);

  return { step, draft, update, processing, saved, startWithFiles, startWithUrl, addPhoto: processPhoto, keepOriginal, restart, save, next, queued: queue.current.length };
}
