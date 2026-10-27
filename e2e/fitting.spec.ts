import { expect, test } from '@playwright/test';

// 완료 확인 시나리오 4~7, 10(모바일 피팅룸)
test.describe('피팅룸 데스크톱', () => {
  test.use({ viewport: { width: 1440, height: 920 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/fitting/l_camo?reset=1');
    await expect(page.getByRole('heading', { name: '카모 카고 스트릿 코디' })).toBeVisible();
  });

  const look = (page: import('@playwright/test').Page) => page.getByRole('region', { name: '룩 상세' });
  const worn = (page: import('@playwright/test').Page) => page.getByRole('list', { name: '입은 옷' });

  test('시나리오 4: 룩 상세, 이 룩 그대로 입혀보기, 쇼핑 리스트에 담기', async ({ page }) => {
    await page.screenshot({ path: 'e2e/screens/d4a-fitting-default.png' });
    await expect(look(page).getByText('≈ 대체 가능')).toBeVisible();
    await expect(look(page).getByText('→ 내 블랙 푸퍼 자켓')).toBeVisible();
    await expect(look(page).getByText('있음', { exact: true })).toBeVisible();
    await expect(look(page).getByText('없음', { exact: true })).toBeVisible();
    await expect(look(page).getByText('내 옷 2/3')).toBeVisible();
    await expect(look(page).getByText('1벌만 더 있으면 완성')).toBeVisible();

    await page.getByRole('button', { name: '이 룩 그대로 입혀보기' }).click();
    const avatar = page.getByRole('img', { name: /^내 아바타/ });
    await expect(avatar).toHaveAttribute('aria-label', '내 아바타. 입은 옷: 블랙 푸퍼 자켓, 화이트 롱슬리브 티, 카모 와이드 카고 팬츠(쇼핑몰 상품), 화이트 스니커즈');
    await expect(avatar.getByText('쇼핑몰 상품')).toBeVisible();
    await expect(page.getByText('쇼핑몰 상품 1벌 · 아직 없는 옷')).toBeVisible();
    await page.screenshot({ path: 'e2e/screens/d4b-fitting-look-worn.png' });

    await look(page).getByRole('button', { name: '쇼핑 리스트에 담기' }).click();
    await expect(look(page).getByRole('link', { name: '쇼핑 리스트에 있어요' })).toBeVisible();
    await expect(page.getByRole('link', { name: '쇼핑 리스트, 3벌' })).toBeVisible();
    await expect(page.getByText('쇼핑몰 상품 1벌 · 쇼핑 리스트에 담겼어요')).toBeVisible();
  });

  test('시나리오 5: 입히기·벗기, 옷 종류 이동, 패널 접기', async ({ page }) => {
    const closet = page.getByRole('complementary', { name: '내 옷장' });
    await closet.getByRole('button', { name: '블랙 슬랙스, 아바타에 입히기' }).click();
    await expect(worn(page).getByText('블랙 슬랙스')).toBeVisible();
    await expect(worn(page).getByText('데님 팬츠')).toHaveCount(0);

    // 끌어다 놓기
    await closet.getByRole('button', { name: '롱 트렌치 코트, 아바타에 입히기' }).dragTo(page.getByRole('img', { name: /^내 아바타/ }));
    await expect(worn(page).getByText('롱 트렌치 코트')).toBeVisible();

    // 아우터를 벗으면 티가 단독 위치로
    const tee = page.locator('img[data-slot="top"]');
    const layeredTop = await tee.evaluate((el) => (el as HTMLElement).style.top);
    await page.getByRole('button', { name: '아우터 벗기' }).click();
    await expect(worn(page).getByText('롱 트렌치 코트')).toHaveCount(0);
    expect(layeredTop).toBe('15.2%');
    await expect(tee).toHaveAttribute('style', /top: 16\.7%/);

    // 옷 종류 8개 중 4개씩
    const cats = closet.getByRole('group', { name: '옷 종류' });
    await expect(cats.getByRole('button')).toHaveText(['전체', '아우터', '상의', '하의']);
    await expect(closet.getByRole('button', { name: '이전 종류' })).toBeDisabled();
    for (let i = 0; i < 4; i++) await closet.getByRole('button', { name: '다음 종류' }).click();
    await expect(cats.getByRole('button')).toHaveText(['신발', '가방', '모자', '액세서리']);
    await expect(closet.getByRole('button', { name: '다음 종류' })).toBeDisabled();
    await cats.getByRole('button', { name: '가방' }).click();
    await expect(closet.getByText('아직 등록한 가방이 없어요.')).toBeVisible();

    // 패널 접기·펼치기(새로고침해도 기억)
    await page.getByRole('button', { name: '내 옷장 접기' }).click();
    await page.getByRole('button', { name: '룩 상세 접기' }).click();
    await expect(page.getByRole('button', { name: '내 옷장 펼치기' })).toBeVisible();
    await expect(page.getByText('룩 상세 · 2/3')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: '룩 상세 펼치기' })).toBeVisible();
    await page.getByRole('button', { name: '내 옷장 펼치기' }).click();
    await page.getByRole('button', { name: '룩 상세 펼치기' }).click();
    await expect(page.getByRole('button', { name: '룩 상세 접기' })).toBeVisible();
  });

  test('시나리오 6: 이미 비슷한 옷이 있어요 → 대체 가능, 되돌리기', async ({ page }) => {
    await look(page).getByRole('button', { name: '이미 비슷한 옷이 있어요' }).click();
    const picker = look(page).getByRole('group', { name: '비슷한 내 하의 고르기' });
    await expect(picker.getByRole('button')).toHaveText(['데님 팬츠', '블랙 슬랙스', '와이드 치노 팬츠', '취소']);
    await picker.getByRole('button', { name: '와이드 치노 팬츠' }).click();
    await expect(look(page).getByText('내 옷 3/3')).toBeVisible();
    await expect(look(page).getByText('→ 내 와이드 치노 팬츠')).toBeVisible();
    await expect(look(page).getByText('내 옷으로 완성할 수 있어요')).toBeVisible();
    await look(page).getByRole('button', { name: '되돌리기' }).click();
    await expect(look(page).getByText('내 옷 2/3')).toBeVisible();
  });

  test('시나리오 7: 코디 저장', async ({ page }) => {
    await page.getByRole('button', { name: '이 룩 그대로 입혀보기' }).click();
    await page.getByRole('button', { name: '코디 저장' }).click();
    await expect(page.getByLabel('코디 이름')).toHaveValue('카모 카고 스트릿 코디');
    await page.getByLabel('코디 이름').fill('카모 주말');
    await page.getByRole('button', { name: '저장', exact: true }).click();
    await expect(page.getByText('‘카모 주말’ 저장했어요')).toBeVisible();
    const count = await page.evaluate(
      () =>
        new Promise<number>((done) => {
          const req = indexedDB.open('closet-look');
          req.onsuccess = () => {
            const r = req.result.transaction('outfits').objectStore('outfits').count();
            r.onsuccess = () => done(r.result);
          };
        }),
    );
    expect(count).toBe(5);
  });

  test('룩 없이 열면 안내, 옷 0벌이면 등록 안내', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/fitting?empty=1');
    await expect(page.getByText('룩을 고르면 아이템마다 내 옷과 비교해 보여 줘요.')).toBeVisible();
    await expect(page.getByText('아직 등록한 옷이 없어요.')).toBeVisible();
    await expect(page.getByRole('img', { name: '내 아바타. 입은 옷: 없음' })).toBeVisible();
  });

  test('1280px 미만에서 룩 상세 자동 접힘', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 });
    await expect(page.getByRole('button', { name: '룩 상세 펼치기' })).toBeVisible();
  });
});

test.describe('피팅룸 모바일', () => {
  test.use({ viewport: { width: 390, height: 844 } });

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
});
