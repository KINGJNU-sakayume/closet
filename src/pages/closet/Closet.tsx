import { Link, useSearchParams } from 'react-router-dom';
import { ButtonLink } from '../../components/Button';
import { GarmentThumb } from '../../components/GarmentThumb';
import { Icon } from '../../components/Icon';
import { useGarments, useLooks, useOutfits } from '../../db/hooks';
import { CLOSET_CATEGORIES, productIndex, SLOT_LABEL, SLOTS } from '../../domain/catalog';
import { usageCount } from '../../domain/closet';
import { assetUrl } from '../../domain/looks';
import { outfitShopProducts } from '../../domain/shopping';
import type { Category, Garment, Outfit, Product } from '../../domain/types';
import styles from './Closet.module.css';

type Tab = 'items' | 'outfits';
type Cat = Category | 'all';

// 내 옷장: 옷 / 코디 탭. 탭과 종류는 주소에 남긴다.
export function Closet() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'outfits' ? 'outfits' : 'items';
  const garments = useGarments();
  const outfits = useOutfits();
  const looks = useLooks();

  if (!garments || !outfits || !looks) return <main className={styles.page} aria-busy="true" />;

  const setTab = (t: Tab) => setParams({ tab: t }, { replace: true });
  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'items', label: '옷', count: garments.length },
    { value: 'outfits', label: '코디', count: outfits.length },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>내 옷장</h1>
          <p className={styles.sub}>가진 옷과, 그 옷으로 만든 코디를 모아 둬요.</p>
        </div>
        <div role="tablist" aria-label="옷장 보기" className={styles.tabs}>
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              id={`closet-tab-${t.value}`}
              aria-selected={tab === t.value}
              aria-controls={`closet-panel-${t.value}`}
              className={[styles.tab, tab === t.value && styles.tabOn].filter(Boolean).join(' ')}
              onClick={() => setTab(t.value)}
            >
              {t.label} <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" id={`closet-panel-${tab}`} aria-labelledby={`closet-tab-${tab}`} className={styles.panel}>
        {tab === 'items' ? <Items garments={garments} outfits={outfits} /> : <Outfits garments={garments} outfits={outfits} products={productIndex(looks)} />}
      </div>
    </main>
  );
}

function Items({ garments, outfits }: { garments: Garment[]; outfits: Outfit[] }) {
  const [params, setParams] = useSearchParams();
  const cat = (params.get('cat') as Cat | null) ?? 'all';
  if (garments.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>아직 등록한 옷이 없어요</h2>
        <p className={styles.muted}>옷을 등록하면 룩과 비교하고 아바타에 입혀 볼 수 있어요.</p>
        <ButtonLink to="/register">옷 등록하기</ButtonLink>
      </div>
    );
  }
  // 등록된 옷이 있는 종류만 보여 준다(전체·아우터·상의·하의·신발은 항상)
  const cats = CLOSET_CATEGORIES.filter((c) => c.value === 'all' || (SLOTS as string[]).includes(c.value) || garments.some((g) => g.attrs.category === c.value));
  const usage = new Map(garments.map((g) => [g.id, usageCount(g.id, outfits)]));
  const shown = garments.filter((g) => cat === 'all' || g.attrs.category === cat).sort((a, b) => usage.get(b.id)! - usage.get(a.id)!);
  return (
    <>
      <div className={styles.bar}>
        <div role="group" aria-label="옷 종류" className={styles.cats}>
          {cats.map((c) => {
            const on = c.value === cat;
            const n = c.value === 'all' ? garments.length : garments.filter((g) => g.attrs.category === c.value).length;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={on}
                className={[styles.cat, on && styles.catOn].filter(Boolean).join(' ')}
                onClick={() => setParams({ tab: 'items', ...(c.value === 'all' ? {} : { cat: c.value }) }, { replace: true })}
              >
                {c.label} <span className={styles.tabCount}>{n}</span>
              </button>
            );
          })}
        </div>
        <span className={styles.muted}>코디에 많이 쓰인 순</span>
      </div>
      <div className={styles.items}>
        {shown.map((g) => {
          const n = usage.get(g.id)!;
          return (
            <Link key={g.id} to={`/fitting?wear=${g.id}`} className={styles.item} aria-label={`${g.alias}, ${n ? `코디 ${n}개에 쓰임` : '아직 코디에 안 쓰였어요'}, 피팅룸에서 입혀보기`}>
              <span className={styles.itemThumb}>
                <GarmentThumb image={g.cutout} category={g.attrs.category} colorHex={g.colorHex} alt="" inset={g.cutout ? 10 : 21} />
              </span>
              <span>
                <span className={styles.itemName}>{g.alias}</span>
                <span className={styles.usage}>{n ? `코디 ${n}개에 쓰임` : '아직 코디에 안 쓰였어요'}</span>
              </span>
            </Link>
          );
        })}
        {shown.length === 0 && <p className={styles.muted}>이 종류의 옷이 없어요.</p>}
      </div>
    </>
  );
}

function Outfits({ garments, outfits, products }: { garments: Garment[]; outfits: Outfit[]; products: Map<string, Product> }) {
  return (
    <>
      {outfits.length > 0 && <p className={styles.intro}>피팅룸에서 입혀 보고 저장한 조합이에요. 쇼핑몰 상품이 섞인 코디는 산 뒤에 완성돼요.</p>}
      <div className={styles.outfits}>
        <Link to="/fitting" className={styles.newOutfit}>
          <Icon name="plus" size={22} />
          <span className={styles.newTitle}>새 코디 만들기</span>
          <span className={styles.muted}>피팅룸에서 입혀 보고 저장해요</span>
        </Link>
        {outfits.map((o) => {
          const shop = new Set(outfitShopProducts(o, garments));
          return (
            <article key={o.id} className={styles.outfit}>
              <div className={styles.tiles}>
                {SLOTS.map((slot) => {
                  const ref = o.slots[slot];
                  const g = ref?.garmentId ? garments.find((x) => x.id === ref.garmentId) : ref?.productId ? garments.find((x) => x.fromProductId === ref.productId) : undefined;
                  const p = !g && ref?.productId ? products.get(ref.productId) : undefined;
                  const name = g?.alias ?? p?.alias;
                  return (
                    <span key={slot} className={styles.tile}>
                      {g && <GarmentThumb image={g.cutout} category={g.attrs.category} colorHex={g.colorHex} alt={g.alias} inset={g.cutout ? 10 : 21} />}
                      {p && <GarmentThumb image={p.image ? assetUrl(p.image) : undefined} category={p.attrs.category} colorHex={p.colorHex} alt={p.alias} inset={p.image ? 10 : 21} />}
                      {!name && <span className="visually-hidden">{SLOT_LABEL[slot]} 없음</span>}
                      {p && shop.has(p.id) && <span className={styles.shopLabel}>쇼핑몰 상품</span>}
                    </span>
                  );
                })}
              </div>
              <div>
                <h2 className={styles.outfitTitle}>{o.title}</h2>
                <div className={shop.size ? styles.metaShop : styles.metaOwn}>{shop.size ? `쇼핑몰 상품 ${shop.size}벌 포함 · 사면 완성` : '전부 내 옷 · 지금 입을 수 있어요'}</div>
              </div>
              <div className={styles.outfitActions}>
                <Link to={`/fitting?outfit=${o.id}`} className={styles.action}>
                  <Icon name="hanger" />
                  피팅룸에서 열기
                </Link>
                {shop.size > 0 && (
                  <Link to="/shopping" className={[styles.action, styles.accent].join(' ')}>
                    쇼핑 리스트 보기
                    <Icon name="arrowRight" size={16} />
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
