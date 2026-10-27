import { expect, test } from '@playwright/test';

// 1단계 뼈대: 7개 라우트가 열리고, 데스크톱 헤더 / 모바일 탭 바가 시안 구조와 같은지 본다.
const routes = ['/', '/explore?q=가을 남자 코트 코디', '/fitting', '/closet?tab=items', '/shopping', '/register', '/dev/components'];
const viewports = { d: { width: 1440, height: 900 }, m: { width: 390, height: 844 } };

for (const [name, viewport] of Object.entries(viewports)) {
  test.describe(name, () => {
    test.use({ viewport });
    for (const route of routes) {
      test(`screenshot ${route}`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const file = route.replace(/[/?=& ]+/g, '_').replace(/^_|_$/g, '') || 'landing';
        await page.screenshot({ path: `e2e/screens/${name}-${file}.png`, fullPage: true });
      });
    }
  });
}

test.describe('desktop header', () => {
  test.use({ viewport: viewports.d });
  test('탭 4개, 선택 탭 aria-current, 쇼핑 리스트 숫자', async ({ page }) => {
    await page.goto('/explore');
    const nav = page.getByRole('navigation', { name: '주 메뉴' });
    await expect(nav.getByRole('link')).toHaveCount(4);
    await expect(nav.getByRole('link', { name: '룩 탐색' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: '쇼핑 리스트, 2벌' })).toBeVisible();
    await page.getByRole('link', { name: '옷 등록' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });

  test('Tab 키 포커스가 보인다', async ({ page }) => {
    await page.goto('/explore');
    await page.keyboard.press('Tab');
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).toBe('solid');
  });
});

test.describe('mobile', () => {
  test.use({ viewport: viewports.m });
  test('하단 탭 바 4개, 헤더 숨김', async ({ page }) => {
    await page.goto('/explore');
    const navs = page.getByRole('navigation', { name: '주 메뉴' });
    await expect(navs).toHaveCount(1);
    await expect(navs.getByRole('link')).toHaveCount(4);
    await expect(page.getByRole('heading', { name: '룩 탐색', level: 1 })).toBeVisible();
  });

  test('옷 등록과 랜딩에는 탭 바가 없다', async ({ page }) => {
    for (const route of ['/register', '/']) {
      await page.goto(route);
      await expect(page.getByRole('link', { name: '쇼핑 리스트, 2벌' })).toHaveCount(0);
    }
    await page.goto('/register');
    await expect(page.getByText('1 / 3')).toBeVisible();
  });
});
