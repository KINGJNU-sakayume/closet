import type { Look } from './types';

/** public/looks/index.json의 순서(= 추천순)대로 룩 JSON을 읽는다. */
export async function loadLooks(base = import.meta.env.BASE_URL): Promise<Look[]> {
  const get = async <T,>(path: string): Promise<T> => {
    const res = await fetch(`${base}looks/${path}`);
    if (!res.ok) throw new Error(`룩을 불러오지 못했어요: ${path} (${res.status})`);
    return res.json() as Promise<T>;
  };
  const files = await get<string[]>('index.json');
  return Promise.all(files.map((f) => get<Look>(f)));
}

/** 'assets/look.png' 같은 상대 경로를 배포 경로 기준으로 바꾼다. */
export function assetUrl(path: string, base = import.meta.env.BASE_URL): string {
  return /^(https?:|blob:|data:)/.test(path) ? path : `${base}${path.replace(/^\//, '')}`;
}
