import { expect, test, type Page } from '@playwright/test';

// 완료 확인 시나리오 7(코디 저장 → 내 옷장), 8(쇼핑 리스트), 11(저장 유지)
async function addCamoToList(page: Page) {
  await page.goto('/fitting/l_camo?reset=1');
  await page.getByRole('region', { name: '룩 상세' }).getByRole('button', { name: '쇼핑 리스트에 담기' }).click();
  await expect(page.getByRole('link', { name: '쇼핑 리스트, 3벌' })).toBeVisible();
}

const card = (page: Page, title: string) => page.getByRole('article').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test.describe('데스크톱', () => {
  test.use({ viewport: { width: 1440, height: 1000 } });

  test('시나리오 7: 코디 저장 → 코디 탭 5번째 카드, 코디 N개에 쓰임이 늘어난다', async ({ page }) => {
    await page.goto('/closet?tab=items&reset=1');
    const sneakers = page.getByRole('link', { name: /^화이트 스니커즈, 코디 3개에 쓰임/ });
    await expect(sneakers).toBeVisible();
    await expect(page.getByRole('link', { name: /^블랙 슬랙스, 코디 1개에 쓰임/ })).toBeVisible();

    await page.goto('/fitting/l_camo');
    await page.getByRole('button', { name: '블랙 슬랙스, 아바타에 입히기' }).click();
    await page.getByRole('button', { name: '코디 저장' }).click();
    await page.getByLabel('코디 이름').fill('슬랙스 주말');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await page.getByRole('link', { name: '내 코디 보기' }).click();

    await expect(page.getByRole('tab', { name: '코디 5', selected: true })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
    await expect(card(page, '슬랙스 주말').getByText('전부 내 옷 · 지금 입을 수 있어요')).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/d5a-closet-outfits.png', fullPage: true });

    await page.getByRole('tab', { name: /^옷/ }).click();
    await expect(page.getByRole('link', { name: /^화이트 스니커즈, 코디 4개에 쓰임/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /^블랙 슬랙스, 코디 2개에 쓰임/ })).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/d5b-closet-items.png', fullPage: true });

    // 코디 열기 → 피팅룸에 그 조합
    await page.getByRole('tab', { name: /^코디/ }).click();
    await card(page, '트렌치 출근').getByRole('link', { name: '피팅룸에서 열기' }).click();
    await expect(page.getByRole('img', { name: /^내 아바타/ })).toHaveAttribute('aria-label', '내 아바타. 입은 옷: 롱 트렌치 코트, 블랙 니트, 블랙 슬랙스, 첼시 부츠');
  });

  test('시나리오 8: 쇼핑 리스트 정렬, 샀어요와 되돌리기, 빼기', async ({ page }) => {
    await addCamoToList(page);
    await page.getByRole('link', { name: '쇼핑 리스트, 3벌' }).click();
    const rows = page.getByRole('main').getByRole('listitem');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('카모 와이드 카고 팬츠');
    await expect(rows.nth(0)).toContainText('사면 완성되는 코디 2개');
    await expect(rows.nth(1)).toContainText('네이비 울 코트');
    await expect(rows.nth(2)).toContainText('카키 필드 재킷');
    await expect(rows.nth(0).getByRole('link', { name: '구매하러 가기 (새 탭)' })).toHaveAttribute('target', '_blank');
    await page.screenshot({ path: 'e2e/screens/d6-shopping.png', fullPage: true });

    await rows.nth(0).getByRole('button', { name: '샀어요' }).click();
    await expect(rows.nth(0).getByText('옷장으로 옮겼어요')).toBeVisible();
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 2벌' })).toBeVisible();

    await page.getByRole('link', { name: '내 옷장', exact: true }).click();
    await expect(page.getByRole('tab', { name: '옷 11' })).toBeVisible();
    await page.getByRole('tab', { name: /^코디/ }).click();
    await expect(card(page, '카모 카고 스트릿').getByText('전부 내 옷 · 지금 입을 수 있어요')).toBeVisible();
    await page.goto('/explore?q=가을 남자 코트 코디');
    await expect(page.getByRole('link', { name: /카모 카고 스트릿 코디/ })).toContainText('내 옷 3/3');
    await expect(page.getByRole('link', { name: /카모 카고 스트릿 코디/ })).toContainText('내 옷으로 완성');

    // 산 옷은 피팅룸에서 내 옷으로
    await page.goto('/fitting/l_camo');
    await page.getByRole('button', { name: '이 룩 그대로 입혀보기' }).click();
    await expect(page.getByText('전부 내 옷이에요')).toBeVisible();

    // 되돌리기: 다시 같은 화면에서 눌러야 하므로 새로 사고 바로 되돌린다
    await page.goto('/shopping?reset=1');
    await addCamoToList(page);
    await page.goto('/shopping');
    await rows.nth(0).getByRole('button', { name: '샀어요' }).click();
    await rows.nth(0).getByRole('button', { name: '되돌리기' }).click();
    await expect(rows.nth(0).getByRole('button', { name: '샀어요' })).toBeVisible();
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 3벌' })).toBeVisible();
    await page.getByRole('link', { name: '내 옷장', exact: true }).click();
    await expect(page.getByRole('tab', { name: '옷 10' })).toBeVisible();
    await page.getByRole('tab', { name: /^코디/ }).click();
    await expect(card(page, '카모 카고 스트릿').getByText('쇼핑몰 상품 1벌 포함 · 사면 완성')).toBeVisible();

    // 빼기는 목록에서만 사라진다
    await page.goto('/shopping');
    await page.getByRole('button', { name: '네이비 울 코트 쇼핑 리스트에서 빼기' }).click();
    await expect(rows).toHaveCount(2);
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 2벌' })).toBeVisible();
    await page.getByRole('link', { name: '내 옷장', exact: true }).click();
    await expect(page.getByRole('tab', { name: '옷 10' })).toBeVisible();
  });

  test('빈 리스트 + 룩 둘러보기, 옷 0벌·코디 0개', async ({ page }) => {
    await page.goto('/shopping?empty=1');
    await expect(page.getByText('쇼핑 리스트가 비었어요')).toBeVisible();
    await expect(page.getByRole('link', { name: '룩 둘러보기' })).toBeVisible();
    await page.goto('/closet?tab=items');
    await expect(page.getByText('아직 등록한 옷이 없어요')).toBeVisible();
    await page.goto('/closet?tab=outfits');
    await expect(page.getByRole('article')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /새 코디 만들기/ })).toBeVisible();
  });

  test('시나리오 11: 새로고침 후에도 옷·코디·쇼핑 리스트 유지', async ({ page }) => {
    await addCamoToList(page);
    await page.getByRole('button', { name: '코디 저장' }).click();
    await page.getByLabel('코디 이름').fill('남는 코디');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    // 저장이 끝난 뒤(확인 문구) 새로고침
    await expect(page.getByText('‘남는 코디’ 저장했어요')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 3벌' })).toBeVisible();
    await page.goto('/closet?tab=outfits');
    await expect(page.getByRole('heading', { name: '남는 코디' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('tab', { name: '코디 5' })).toBeVisible();
  });
});
