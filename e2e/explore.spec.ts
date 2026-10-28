import { expect, test } from '@playwright/test';

// 완료 확인 시나리오 2(검색), 3(룩 탐색), 10(모바일 룩 탐색)
const ORDER_MINE = ['베이지 트렌치 출근룩', '그레이 후드 레이어드', '네이비 코트 미니멀', '브라운 코트 캠퍼스룩', '카키 필드 재킷', '카모 카고 스트릿 코디', '차콜 롱코트 다크톤', '데님 온 데님'];

test.describe('데스크톱', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('시나리오 2: 검색 패널', async ({ page }) => {
    await page.goto('/explore?reset=1');
    await page.evaluate(() => localStorage.clear());
    const opener = page.getByRole('button', { name: /^룩 검색/ });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: '룩 검색' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('최근 검색이 없어요.')).toBeVisible();
    await expect(dialog.getByRole('searchbox')).toBeFocused();

    // 검색 두 번으로 최근 검색 만들기
    await dialog.getByRole('searchbox').fill('카모 팬츠 코디');
    await page.keyboard.press('Enter');
    await opener.click();
    await dialog.getByRole('searchbox').fill('가을 남자 코트 코디');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/q=%EA%B0%80%EC%9D%84/);
    await opener.click();
    await expect(dialog.getByRole('button', { name: '가을 남자 코트 코디', exact: true })).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/d2-search-panel.png' });

    await dialog.getByRole('button', { name: '카모 팬츠 코디 검색 기록 지우기' }).click();
    await expect(dialog.getByRole('button', { name: '카모 팬츠 코디', exact: true })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: '가을 남자 코트 코디', exact: true })).toBeVisible();

    await dialog.getByRole('searchbox').fill('코트');
    const first = dialog.getByRole('button', { name: '가을 남자 코트 코디' });
    await expect(first.locator('strong')).toHaveText('코트');

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();

    // 바깥 클릭으로 닫힘, 전체 지우기
    await opener.click();
    await page.mouse.click(40, 800);
    await expect(dialog).toHaveCount(0);
    await opener.click();
    await dialog.getByRole('button', { name: '전체 지우기' }).click();
    await expect(dialog.getByText('최근 검색이 없어요.')).toBeVisible();

    // 상황으로 찾기, 내 옷으로 찾기
    await dialog.getByRole('button', { name: '출근' }).click();
    await expect(page.getByRole('link', { name: /베이지 트렌치 출근룩/ })).toBeVisible();
    await expect(page.getByText('룩 1개')).toBeVisible();
    await opener.click();
    await dialog.getByRole('link', { name: '블랙 푸퍼 자켓과 어울리는 룩 찾기' }).click();
    await expect(page.getByRole('heading', { name: '블랙 푸퍼 자켓과 어울리는 룩' })).toBeVisible();
    await expect(page.getByText('룩 2개')).toBeVisible();
  });

  test('시나리오 3: 결과 8개, 정렬, 내 옷으로 완성 가능한 룩만', async ({ page }) => {
    await page.goto('/explore?q=가을 남자 코트 코디&reset=1');
    await expect(page.getByRole('heading', { name: '가을 남자 코트 코디' })).toBeVisible();
    await expect(page.getByText('룩 8개 · 내 옷장 10벌과 비교했어요')).toBeVisible();
    const cards = page.locator('main a[href*="/fitting/"]');
    await expect(cards).toHaveCount(8);
    await expect(page.getByRole('button', { name: '내 옷 많은 순', pressed: true })).toBeVisible();
    // 카드 글자는 제목으로 시작한다(사진에는 글자가 없음)
    const titles = () => cards.evaluateAll((els, order) => els.map((el) => order.find((t) => el.textContent?.startsWith(t))), ORDER_MINE);
    expect(await titles()).toEqual(ORDER_MINE);
    await expect(cards.filter({ hasText: '내 옷으로 완성' })).toHaveCount(2);
    await page.screenshot({ path: 'e2e/screens/d3-explore.png', fullPage: true });

    await page.getByRole('button', { name: '추천순' }).click();
    expect((await titles())[0]).toBe('카모 카고 스트릿 코디');

    await page.getByRole('checkbox', { name: '내 옷으로 완성 가능한 룩만' }).check();
    await expect(cards).toHaveCount(2);
    await expect(page).toHaveURL(/mine=1/);

    await cards.first().click();
    await expect(page).toHaveURL(/\/fitting\/l_trench/);
  });

  test('빈 상태: 완성 가능한 룩 없음 + 옷 등록', async ({ page }) => {
    await page.goto('/explore?mine=1&empty=1');
    await expect(page.getByText('내 옷만으로 완성되는 룩이 아직 없어요')).toBeVisible();
    await page.getByRole('link', { name: '옷 등록하기' }).click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
