import { expect, test, type Page } from '@playwright/test';
import { fileURLToPath } from 'node:url';

// 완료 확인 시나리오 9: 옷 등록. 배경 제거 모델을 실제로 내려받아 돌리므로 오래 걸린다.
const photo = fileURLToPath(new URL('../reference/assets/tee_original.png', import.meta.url));

async function closetCount(page: Page) {
  return page.evaluate(
    () =>
      new Promise<number>((done) => {
        const req = indexedDB.open('closet-look');
        req.onsuccess = () => {
          const r = req.result.transaction('garments').objectStore('garments').count();
          r.onsuccess = () => done(r.result);
        };
      }),
  );
}

test.describe('옷 등록', () => {
  test.setTimeout(240_000);

  test('데스크톱: 업로드 → 배경 제거 → 별칭 → 옷장에 추가', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/register?reset=1');
    await expect(page.getByRole('heading', { name: '옷 등록', level: 1 })).toBeVisible();
    await expect(page.locator('li[aria-current="step"]')).toHaveText('1사진');
    await page.screenshot({ path: 'e2e/screens/d7a-register-step1.png', fullPage: true });

    await page.getByTestId('photo-input').setInputFiles(photo);
    await expect(page.getByRole('status')).toContainText('배경을 지우는 중이에요');
    await expect(page.getByRole('img', { name: '배경을 지운 결과' })).toBeVisible({ timeout: 200_000 });
    await expect(page.getByRole('img', { name: '원본 사진' })).toBeVisible();

    const alias = page.getByLabel('내 옷장에서 부를 이름');
    await expect(page.getByRole('button', { name: '상의', pressed: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '화이트', pressed: true })).toBeVisible();
    await expect(alias).toHaveValue('화이트 롱슬리브 티');
    await page.screenshot({ path: 'e2e/screens/d7b-register-step2.png', fullPage: true });

    await page.getByRole('button', { name: '블랙' }).click();
    await expect(alias).toHaveValue('블랙 롱슬리브 티');
    await alias.fill('내 블랙 티');
    await page.getByRole('button', { name: '그레이' }).click();
    await expect(alias).toHaveValue('내 블랙 티');

    await page.getByRole('button', { name: '화이트' }).click();
    await alias.fill('화이트 롱슬리브 티');
    await page.getByLabel(/원본 상품명/).fill('FN DOODLE LONG SLV TEE white');
    await page.getByRole('button', { name: '옷장에 추가' }).click();

    await expect(page.getByText('옷장에 추가했어요')).toBeVisible();
    await expect(page.getByText('내 옷장 11벌')).toBeVisible();
    await expect(page.getByText('상의 · 화이트 · 레귤러 · 봄·가을')).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/d7c-register-step3.png', fullPage: true });
    expect(await closetCount(page)).toBe(11);

    await page.getByRole('link', { name: '피팅룸에서 입혀보기' }).click();
    await expect(page).toHaveURL(/\/fitting$/);
    // 피팅룸 옷장에 사진으로 보인다(예시 티 + 새로 등록한 티)
    const tees = page.getByRole('complementary', { name: '내 옷장' }).getByRole('button', { name: /^화이트 롱슬리브 티/ });
    await expect(tees).toHaveCount(2);
    await expect(tees.nth(1).locator('img')).toBeVisible();
    await expect(page.getByText('11벌')).toBeVisible();
  });

  test('상품 링크: 주소만 저장하고 사진 없이 등록', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/register?reset=1');
    await page.getByLabel('상품 주소').fill('musinsa');
    await page.getByRole('button', { name: '주소로 등록' }).click();
    await expect(page.getByText('https://로 시작하는 상품 주소를 넣어 주세요.')).toBeVisible();
    await page.getByLabel('상품 주소').fill('https://www.musinsa.com/products/1');
    await page.getByRole('button', { name: '주소로 등록' }).click();
    await page.getByRole('button', { name: '하의' }).click();
    await page.getByRole('button', { name: '네이비' }).click();
    await expect(page.getByLabel('내 옷장에서 부를 이름')).toHaveValue('네이비 팬츠');
    await page.getByRole('button', { name: '옷장에 추가' }).click();
    await expect(page.getByText('내 옷장 11벌')).toBeVisible();
    await page.getByRole('button', { name: '한 벌 더 등록' }).click();
    await expect(page.locator('li[aria-current="step"]')).toHaveText('1사진');
  });

  test('모바일: 탭 바 없는 전체 화면, 하단 고정 버튼', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/register?reset=1');
    const dialog = page.getByRole('dialog', { name: '옷 등록' });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('navigation', { name: '주 메뉴' })).toHaveCount(0);
    await expect(dialog.getByText('1 / 3')).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/m3a-register-step1.png' });

    await page.locator('input[type=file][multiple]').setInputFiles(photo);
    await expect(dialog.getByText('2 / 3')).toBeVisible();
    await expect(page.getByRole('img', { name: '배경을 지운 결과' })).toBeVisible({ timeout: 200_000 });
    const add = page.getByRole('button', { name: '옷장에 추가' });
    const box = await add.boundingBox();
    expect(box!.y + box!.height).toBeGreaterThan(844 - 60);
    await page.screenshot({ path: 'e2e/screens/m3b-register-step2.png' });

    await add.click();
    await expect(dialog.getByText('3 / 3')).toBeVisible();
    await expect(page.getByText('내 옷장 11벌')).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/m3c-register-step3.png' });

    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/\/register/);
  });
});
