import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { ClosetDB } from './db';
import { initData } from './seed';

const fakeBlob = async (path: string) => new Blob([path], { type: 'image/png' });
let n = 0;
let db: ClosetDB;
const fresh = () => (db = new ClosetDB(`test-${n++}`));

afterEach(async () => {
  await db.delete();
});

describe('initData', () => {
  it('첫 실행: 내 옷 10벌, 코디 4개, 쇼핑 리스트 2벌', async () => {
    fresh();
    expect(await initData(db, '', fakeBlob)).toBe('seeded');
    expect(await db.garments.count()).toBe(10);
    expect(await db.outfits.count()).toBe(4);
    expect(await db.shopping.where('status').equals('wanted').count()).toBe(2);
    const jacket = await db.garments.get('g_jacket');
    expect(jacket?.cutout).toBeDefined();
    expect((await db.garments.get('g_trench'))?.cutout).toBeUndefined();
  });

  it('두 번째 실행은 사용자가 바꾼 데이터를 그대로 둔다', async () => {
    fresh();
    await initData(db, '', fakeBlob);
    await db.shopping.delete('p_navy');
    expect(await initData(db, '', fakeBlob)).toBe('kept');
    expect(await db.shopping.count()).toBe(1);
  });

  it('?reset=1은 예시 데이터를 다시 넣고, ?empty=1은 비운다', async () => {
    fresh();
    await initData(db, '', fakeBlob);
    await db.garments.delete('g_tee');
    await db.overrides.put({ lookId: 'l_camo', productId: 'p_camo', garmentId: 'g_denim' });
    expect(await initData(db, '?reset=1', fakeBlob)).toBe('reset');
    expect(await db.garments.count()).toBe(10);
    expect(await db.overrides.count()).toBe(0);

    expect(await initData(db, '?empty=1', fakeBlob)).toBe('empty');
    expect(await db.garments.count()).toBe(0);
    expect(await db.shopping.count()).toBe(0);
    // 비운 뒤 새로고침해도 다시 채우지 않는다
    expect(await initData(db, '', fakeBlob)).toBe('kept');
    expect(await db.garments.count()).toBe(0);
  });
});
