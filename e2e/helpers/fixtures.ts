import { test as base } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// 배경 제거 모델(IMG.LY CDN)을 테스트 사이에 재사용한다. 파일은 4MB 조각이라 조각마다 따로 받아 두고,
// 네트워크가 끊기면 그 조각만 다시 받는다. 앱 코드는 그대로(CDN)이고 테스트 브라우저의 요청만 가로챈다.
const CACHE = fileURLToPath(new URL('../.cache/imgly/', import.meta.url));
const ATTEMPTS = 5;

export const test = base.extend<{ imglyCache: void }>({
  imglyCache: [
    async ({ page }, use) => {
      mkdirSync(CACHE, { recursive: true });
      await page.route('https://staticimgly.com/**', async (route) => {
        const url = route.request().url();
        const file = CACHE + createHash('sha1').update(url).digest('hex');
        if (existsSync(file)) {
          const meta = JSON.parse(readFileSync(`${file}.json`, 'utf8')) as { status: number; headers: Record<string, string> };
          return route.fulfill({ status: meta.status, headers: meta.headers, body: readFileSync(file) });
        }
        let lastError: unknown;
        for (let i = 0; i < ATTEMPTS; i++) {
          try {
            const res = await route.fetch({ timeout: 60_000 });
            const body = await res.body();
            if (res.ok()) {
              writeFileSync(file, body);
              writeFileSync(`${file}.json`, JSON.stringify({ status: res.status(), headers: res.headers() }));
            }
            return route.fulfill({ response: res, body });
          } catch (e) {
            lastError = e;
          }
        }
        throw lastError;
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
