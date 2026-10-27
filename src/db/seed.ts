import { assetUrl } from '../domain/looks';
import { seedGarments, seedOutfits, seedShopping, seedWorn } from '../domain/seed';
import type { Garment } from '../domain/types';
import type { ClosetDB } from './db';

const SEEDED = 'seeded';
/** 예시 데이터 순서대로 보이도록 1초씩 차이를 둔다 */
const at = (i: number) => new Date(Date.UTC(2026, 9, 1) + i * 1000).toISOString();

type FetchBlob = (path: string) => Promise<Blob | undefined>;

const fetchAsset: FetchBlob = async (path) => {
  const res = await fetch(assetUrl(path));
  return res.ok ? res.blob() : undefined;
};

export const WORN = 'worn';

async function clear(db: ClosetDB) {
  await Promise.all([db.garments.clear(), db.outfits.clear(), db.shopping.clear(), db.overrides.clear(), db.meta.delete(WORN)]);
}

/** 예시 데이터를 넣는다. 예시 옷 사진은 Blob으로 바꿔 내 옷과 같은 방식으로 저장한다. */
export async function seed(db: ClosetDB, fetchBlob: FetchBlob = fetchAsset) {
  const garments: Garment[] = await Promise.all(
    seedGarments.map(async ({ image, ...g }, i) => ({
      ...g,
      createdAt: at(i),
      ...(image ? { cutout: await fetchBlob(image) } : {}),
    })),
  );
  await db.transaction('rw', [db.garments, db.outfits, db.shopping, db.overrides, db.meta], async () => {
    await clear(db);
    await db.garments.bulkAdd(garments);
    await db.outfits.bulkAdd(seedOutfits.map((o, i) => ({ ...o, createdAt: at(i) })));
    await db.shopping.bulkAdd(seedShopping);
    await db.meta.put({ key: WORN, value: JSON.stringify(seedWorn) });
    await db.meta.put({ key: SEEDED, value: new Date().toISOString() });
  });
}

/**
 * 첫 실행 때만 예시 데이터를 넣는다. 개발용으로 ?reset=1은 다시 넣고 ?empty=1은 비운다.
 * 화면에는 초기화 버튼을 두지 않는다.
 */
export async function initData(db: ClosetDB, search: string, fetchBlob?: FetchBlob): Promise<'seeded' | 'reset' | 'empty' | 'kept'> {
  const params = new URLSearchParams(search);
  if (params.get('empty') === '1') {
    await db.transaction('rw', [db.garments, db.outfits, db.shopping, db.overrides, db.meta], async () => {
      await clear(db);
      await db.meta.put({ key: SEEDED, value: 'empty' });
    });
    return 'empty';
  }
  if (params.get('reset') === '1') {
    await seed(db, fetchBlob);
    return 'reset';
  }
  if (await db.meta.get(SEEDED)) return 'kept';
  await seed(db, fetchBlob);
  return 'seeded';
}
