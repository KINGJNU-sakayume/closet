import { type Page } from '@playwright/test';
import { expect, test } from './helpers/fixtures';
import { fileURLToPath } from 'node:url';
import { waitForCutout } from './helpers/cutout';

// 모바일(390×844): 완료 확인 시나리오 10과 모바일 규칙(가로 스크롤 없음, 누르는 영역 44px, 입력칸 16px·48px)
const photo = fileURLToPath(new URL('../reference/assets/tee_original.png', import.meta.url));

/** 보이는 버튼·링크·탭 중 높이 44px 미만인 것, 그리고 페이지 가로 폭 */
async function layoutIssues(page: Page) {
  await page.waitForTimeout(300);
  return page.evaluate(() => {
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden';
    };
    const small = Array.from(document.querySelectorAll('a[href], button, [role=tab], [role=radio]'))
      .filter(visible)
      .filter((el) => el.getBoundingClientRect().height < 44)
      .map((el) => (el.getAttribute('aria-label') ?? el.textContent ?? '').trim());
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[type=text], input[type=search], input[type=url]'))
      .filter(visible)
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16 || el.getBoundingClientRect().height < 48)
      .map((el) => el.id || el.type);
    return { scrollWidth: document.documentElement.scrollWidth, small, inputs };
  });
}

const clean = { scrollWidth: 390, small: [], inputs: [] };

test.describe('모바일', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('모든 화면: 가로 스크롤 없음, 누르는 영역 44px, 입력칸 16px·48px', async ({ page }) => {
    await page.goto('/explore?reset=1');
    expect(await layoutIssues(page)).toEqual(clean);
    await page.getByRole('button', { name: /추천순/ }).click();
    expect(await layoutIssues(page)).toEqual(clean);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '룩 검색' }).last().click();
    expect(await layoutIssues(page)).toEqual(clean);
    await page.getByRole('button', { name: '취소' }).click();
    for (const route of ['/fitting/l_camo', '/closet?tab=items', '/closet?tab=outfits', '/shopping', '/register']) {
      await page.goto(route);
      expect(await layoutIssues(page), route).toEqual(clean);
    }
    await page.getByRole('button', { name: '상품 링크로 등록' }).click();
    await page.getByLabel('상품 주소').fill('https://example.com/p');
    await page.getByRole('button', { name: '주소로 등록' }).click();
    expect(await layoutIssues(page), '등록 2단계').toEqual(clean);
    // 하단 고정 버튼이 마지막 입력칸을 가리지 않는다
    const last = page.getByLabel('상품 주소');
    await last.scrollIntoViewIfNeeded();
    const [field, bar] = [await last.boundingBox(), await page.getByRole('button', { name: '옷장에 추가' }).boundingBox()];
    expect(field!.y + field!.height).toBeLessThanOrEqual(bar!.y);
  });

  test('옷 등록을 취소하면 열었던 + 버튼으로 포커스가 돌아온다', async ({ page }) => {
    await page.goto('/explore?reset=1');
    await page.getByRole('link', { name: '옷 등록' }).click();
    await expect(page.getByRole('dialog', { name: '옷 등록' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/explore/);
    await expect(page.getByRole('link', { name: '옷 등록' })).toBeFocused();
  });

  test('시나리오 10: 2열 그리드, 정렬 시트', async ({ page }) => {
    await page.goto('/explore?q=가을 남자 코트 코디&reset=1');
    await expect(page.getByRole('navigation', { name: '주 메뉴' }).getByRole('link')).toHaveCount(4);
    const cards = page.locator('main a[href*="/fitting/"]');
    await expect(cards).toHaveCount(8);
    // 2열: 첫 두 카드가 같은 줄(글꼴을 받는 동안 줄이 움직일 수 있어 자리 잡을 때까지 기다린다)
    await expect.poll(async () => (await cards.nth(0).boundingBox())!.y === (await cards.nth(1).boundingBox())!.y).toBe(true);
    await expect(cards.first()).toContainText('카모 카고 스트릿 코디');
    await page.screenshot({ path: 'e2e/screens/m1a-explore.png' });

    const sortBtn = page.getByRole('button', { name: /추천순/ });
    await sortBtn.click();
    const sheet = page.getByRole('dialog', { name: '정렬' });
    await expect(sheet.getByRole('radio', { name: '추천순' })).toHaveAttribute('aria-checked', 'true');
    await page.screenshot({ path: 'e2e/screens/m1b-explore-sort-sheet.png' });
    await sheet.getByRole('radio', { name: '내 옷 많은 순' }).click();
    await expect(sheet).toHaveCount(0);
    await expect(cards.first()).toContainText('베이지 트렌치 출근룩');
    await expect(page.getByRole('button', { name: /내 옷 많은 순/ })).toBeFocused();

    // 모바일 검색은 전체 화면
    await page.getByRole('button', { name: /가을 남자 코트 코디/ }).click();
    const search = page.getByRole('dialog', { name: '룩 검색' });
    await expect(search).toBeVisible();
    await search.getByRole('button', { name: '취소' }).click();
    await expect(search).toHaveCount(0);
  });

  test('시나리오 10: 시트 256/560, 탭으로 입고 벗기', async ({ page }) => {
    await page.goto('/fitting/l_camo?reset=1');
    const sheet = page.getByRole('region', { name: '내 옷장과 룩 상세' });
    await expect(sheet).toBeVisible();
    expect((await sheet.boundingBox())!.height).toBe(256);
    await page.screenshot({ path: 'e2e/screens/m2a-fitting-closet-sheet.png' });

    await page.getByRole('button', { name: '시트 크게 보기' }).click();
    await expect.poll(async () => (await sheet.boundingBox())!.height).toBe(560);
    await page.getByRole('button', { name: '시트 작게 보기' }).click();
    await expect.poll(async () => (await sheet.boundingBox())!.height).toBe(256);

    const slacks = sheet.getByRole('button', { name: /^블랙 슬랙스/ });
    await slacks.click();
    await expect(slacks).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('img', { name: /^내 아바타/ })).toHaveAttribute('aria-label', /블랙 슬랙스/);
    await slacks.click();
    await expect(slacks).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('img', { name: /^내 아바타/ })).not.toHaveAttribute('aria-label', /블랙 슬랙스/);

    await page.getByRole('tab', { name: /룩 상세/ }).click();
    await expect.poll(async () => (await sheet.boundingBox())!.height).toBe(560);
    await expect(sheet.getByText('내 옷 2/3')).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/m2b-fitting-look-sheet.png' });
  });

  test('내 옷장·쇼핑 리스트가 1열로 동작', async ({ page }) => {
    await page.goto('/shopping?reset=1');
    await expect(page.getByRole('heading', { name: '쇼핑 리스트', level: 1 })).toBeVisible();
    const rows = page.getByRole('main').getByRole('listitem');
    await expect(rows).toHaveCount(2);
    const w = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(w).toBeLessThanOrEqual(390);
    await page.goto('/closet?tab=outfits');
    await expect(page.getByRole('article')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('모바일: 탭 바 없는 전체 화면, 하단 고정 버튼', async ({ page }) => {
    test.setTimeout(700_000);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/register?reset=1');
      const dialog = page.getByRole('dialog', { name: '옷 등록' });
      await expect(dialog).toBeVisible();
      await expect(page.getByRole('navigation', { name: '주 메뉴' })).toHaveCount(0);
      await expect(dialog.getByText('1 / 3')).toBeVisible();
      await page.screenshot({ path: 'e2e/screens/m3a-register-step1.png' });

      await page.locator('input[type=file][multiple]').setInputFiles(photo);
      await expect(dialog.getByText('2 / 3')).toBeVisible();
      await waitForCutout(page);
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
