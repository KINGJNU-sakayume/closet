import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// 접근성 기준(WCAG 2.1 AA): 모든 화면을 axe로 검사한다. 대비·이름·역할·aria 상태 등.
const routes = [
  '/',
  '/explore?q=가을 남자 코트 코디',
  '/fitting/l_camo',
  '/closet?tab=items',
  '/closet?tab=outfits',
  '/shopping',
  '/register',
];

async function violations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`);
}

for (const [name, viewport] of [
  ['데스크톱', { width: 1440, height: 900 }],
  ['모바일', { width: 390, height: 844 }],
] as const) {
  test.describe(name, () => {
    test.use({ viewport });
    test('모든 화면 axe 위반 없음', async ({ page }) => {
      await page.goto('/?reset=1');
      for (const route of routes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(300);
        expect(await violations(page), route).toEqual([]);
      }
    });

    test('대화상자 axe 위반 없음', async ({ page }) => {
      await page.goto('/explore?reset=1');
      await page.getByRole('button', { name: /^룩 검색/ }).last().click();
      await expect(page.getByRole('dialog', { name: '룩 검색' })).toBeVisible();
      expect(await violations(page), '검색').toEqual([]);
    });
  });
}

test.describe('대화상자·단계별 상태', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('등록 2·3단계, 비슷한 옷 고르기, 샀어요 뒤 axe 위반 없음', async ({ page }) => {
    await page.goto('/register?reset=1');
    await page.getByLabel('상품 주소').fill('https://example.com/p');
    await page.getByRole('button', { name: '주소로 등록' }).click();
    expect(await violations(page), '등록 2단계').toEqual([]);
    await page.getByRole('button', { name: '옷장에 추가' }).click();
    await expect(page.getByText('옷장에 추가했어요')).toBeVisible();
    expect(await violations(page), '등록 3단계').toEqual([]);

    await page.goto('/fitting/l_camo');
    await page.getByRole('button', { name: '이미 비슷한 옷이 있어요' }).click();
    expect(await violations(page), '비슷한 옷 고르기').toEqual([]);
    await page.getByRole('button', { name: '쇼핑 리스트에 담기' }).first().click();

    await page.goto('/shopping');
    await page.getByRole('button', { name: '샀어요' }).first().click();
    await expect(page.getByText('옷장으로 옮겼어요')).toBeVisible();
    expect(await violations(page), '샀어요 뒤').toEqual([]);
  });
});

// 화면 확대 200%: 1440px 화면을 200%로 키우면 보이는 폭은 720px
test.describe('확대 200%', () => {
  test.use({ viewport: { width: 720, height: 450 } });
  test('가로 스크롤 없이 배치 유지', async ({ page }) => {
    await page.goto('/?reset=1');
    for (const route of routes) {
      await page.goto(route);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), route).toBeLessThanOrEqual(720);
    }
  });
});

/** Tab만 눌러 이름이 맞는 요소까지 간다. 지나가는 모든 요소에 포커스 테두리가 보여야 한다. */
async function tabTo(page: Page, name: RegExp, max = 120) {
  for (let i = 0; i < max; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const st = getComputedStyle(el);
      const within = el.closest('form:focus-within');
      const outline = st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) >= 2;
      const formOutline = within ? getComputedStyle(within).outlineStyle !== 'none' : false;
      const box = el.matches('input[type=checkbox]') ? getComputedStyle(el.nextElementSibling as Element).outlineStyle !== 'none' : false;
      const label = el instanceof HTMLInputElement && el.labels?.[0] ? el.labels[0].textContent : null;
      return { name: (el.getAttribute('aria-label') ?? label ?? el.textContent ?? '').trim(), visible: outline || formOutline || box };
    });
    if (!s) continue;
    expect(s.visible, `포커스 테두리: ${s.name}`).toBe(true);
    if (name.test(s.name)) return;
  }
  throw new Error(`Tab으로 ${name}에 닿지 못했어요`);
}

test.describe('키보드만으로', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test('검색 → 룩 → 입히기 → 쇼핑 리스트 담기 → 샀어요', async ({ page }) => {
    await page.goto('/explore?reset=1');
    await expect(page.getByRole('link', { name: 'Closet / Look' })).toBeVisible();
    await tabTo(page, /^룩 검색/);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('searchbox')).toBeFocused();
    await page.keyboard.type('카고');
    await page.keyboard.press('Enter');
    await expect(page.getByText('룩 1개')).toBeVisible();

    await tabTo(page, /^카모 카고 스트릿 코디/);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/fitting\/l_camo/);

    await tabTo(page, /^블랙 슬랙스, 아바타에 입히기/);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('list', { name: '입은 옷' })).toContainText('블랙 슬랙스');

    await tabTo(page, /^쇼핑 리스트에 담기/);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 3벌' })).toBeVisible();
    // 누른 버튼이 '쇼핑 리스트에 있어요' 링크로 바뀌면 그리로 포커스
    await expect(page.getByRole('link', { name: '쇼핑 리스트에 있어요' })).toBeFocused();

    // 이미 비슷한 옷이 있어요 → 첫 후보 → 고르면 되돌리기 → 되돌리면 다시 처음 버튼
    await tabTo(page, /^이미 비슷한 옷이 있어요/);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: '데님 팬츠', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: '되돌리기' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: '이미 비슷한 옷이 있어요' })).toBeFocused();

    await page.goto('/shopping');
    await tabTo(page, /: 샀어요$/);
    await page.keyboard.press('Enter');
    await expect(page.getByText('옷장으로 옮겼어요')).toHaveCount(1);
    // 누른 버튼이 사라지면 같은 행의 되돌리기로 포커스
    await expect(page.getByRole('button', { name: /: 되돌리기$/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('옷장으로 옮겼어요')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /: 샀어요$/ }).first()).toBeFocused();
  });

  test('옷 등록 단계와 체크박스', async ({ page }) => {
    await page.goto('/register?reset=1');
    await tabTo(page, /^상품 주소$/);
    await page.keyboard.type('https://example.com/k');
    await page.keyboard.press('Enter');
    // 단계가 바뀌면 그 단계 제목으로 포커스
    await expect(page.getByRole('heading', { name: '옷 모양 미리보기' })).toBeFocused();
    await tabTo(page, /^겨울$/);
    await page.keyboard.press('Space');
    await expect(page.getByRole('checkbox', { name: '겨울' })).toBeChecked();
    await tabTo(page, /^옷장에 추가$/);
    await page.keyboard.press('Enter');
    await expect(page.getByText('옷장에 추가했어요')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '화이트 롱슬리브 티' })).toBeFocused();
  });
});
