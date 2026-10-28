import { expect, test } from '@playwright/test';

// 완료 확인 시나리오 1: 첫 실행
test.describe('데스크톱', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('랜딩이 열리고 예시 비교는 저장된 옷장으로 계산된다', async ({ page }) => {
    await page.goto('/?reset=1');
    await expect(page.getByRole('heading', { level: 1, name: /있는 옷부터 맞춰 보고/ })).toBeVisible();
    const compare = page.getByRole('region', { name: '예시: 룩과 내 옷장 비교' });
    await expect(compare).toContainText('카모 카고 스트릿 코디');
    await expect(compare).toContainText('내 옷 2/3');
    await expect(compare).toContainText('1벌만 사면 완성');
    await expect(compare).toContainText('→ 내 블랙 푸퍼 자켓');
    await expect(page.getByText('사면 완성되는 코디 2개')).toBeVisible();
    await expect(page.getByRole('link', { name: /소스 코드/ })).toHaveAttribute('href', 'https://github.com/KINGJNU-sakayume/closet');
    await page.screenshot({ path: 'e2e/screens/d1-landing.png', fullPage: true });

    // 내 옷장 10벌, 코디 4개, 헤더 쇼핑 리스트 숫자 2
    await page.getByRole('link', { name: '내 옷장 만들기' }).first().click();
    await expect(page).toHaveURL(/\/register$/);
    await page.goto('/closet');
    await expect(page.getByRole('tab', { name: '옷 10' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '코디 4' })).toBeVisible();
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 2벌' })).toBeVisible();
  });

  test('옷 0벌이면 예시 비교도 0벌 기준', async ({ page }) => {
    await page.goto('/?empty=1');
    await expect(page.getByRole('region', { name: '예시: 룩과 내 옷장 비교' })).toContainText('내 옷 0/3');
    await expect(page.getByText('아직 등록한 옷이 없어요.')).toBeVisible();
  });
});

test.describe('모바일', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('탭 바 없는 세로 스크롤 랜딩, 전체 폭 버튼', async ({ page }) => {
    await page.goto('/?reset=1');
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 2벌' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: '룩 둘러보기' })).toBeVisible();
    const cta = page.getByRole('link', { name: '내 옷장 만들기' });
    expect((await cta.boundingBox())!.width).toBe(358);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.screenshot({ path: 'e2e/screens/m0-landing.png', fullPage: true });
  });
});
