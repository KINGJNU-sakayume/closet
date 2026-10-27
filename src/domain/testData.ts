import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Look } from './types';

// 테스트용: public/looks를 디스크에서 읽는다.
export function readLooks(): Look[] {
  const dir = resolve(__dirname, '../../public/looks');
  const files = JSON.parse(readFileSync(resolve(dir, 'index.json'), 'utf8')) as string[];
  return files.map((f) => JSON.parse(readFileSync(resolve(dir, f), 'utf8')) as Look);
}
