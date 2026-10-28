import { expect, type Page } from '@playwright/test';

/**
 * 배경 제거 결과가 나올 때까지 기다린다. 모델(약 56MB)을 CDN에서 받다가 네트워크가 끊기면
 * 앱이 '배경을 지우지 못했어요'와 '다시 시도'를 보여 주므로, 사용자처럼 다시 시도를 누른다(최대 2번).
 */
export async function waitForCutout(page: Page, retries = 2) {
  const result = page.getByRole('img', { name: '배경을 지운 결과' });
  const failed = page.getByRole('alert').filter({ hasText: '배경을 지우지 못했어요' });
  for (let attempt = 0; ; attempt++) {
    await expect(result.or(failed)).toBeVisible({ timeout: 200_000 });
    if (await result.isVisible()) return;
    if (attempt >= retries) throw new Error(`배경 제거 실패: ${await failed.textContent()}`);
    await failed.getByRole('button', { name: '다시 시도' }).click();
  }
}
