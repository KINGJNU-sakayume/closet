import { useMemo } from 'react';
import { Avatar } from '../../components/Avatar';
import { ButtonLink } from '../../components/Button';
import { GarmentThumb } from '../../components/GarmentThumb';
import { Icon } from '../../components/Icon';
import { LookCover } from '../../components/LookCover';
import { ProgressBar } from '../../components/ProgressBar';
import { Verdict } from '../../components/Verdict';
import { useGarments, useLookResults, useLooks, useOutfits, useShopping } from '../../db/hooks';
import { isSlot, productIndex, type WornItem } from '../../domain/catalog';
import { assetUrl } from '../../domain/looks';
import type { LookResult } from '../../domain/matching';
import { shoppingRows, type ShoppingRow } from '../../domain/shopping';
import type { Garment, Product } from '../../domain/types';
import styles from './Landing.module.css';

/** 예시로 보여 줄 룩: 사진이 있는 룩(예시 데이터의 카모 카고), 없으면 첫 룩 */
const EXAMPLE_LOOK = 'l_camo';
const SOURCE_URL = 'https://github.com/KINGJNU-sakayume/closet';

const missingText = (r: LookResult) => (r.own === r.total ? '내 옷으로 완성' : `${r.total - r.own}벌만 사면 완성`);

const productImage = (p: Product) => (p.image ? assetUrl(p.image) : undefined);

// 랜딩: 룩 사진 + 내 옷장 비교 예시, 옷장·피팅룸·쇼핑 리스트 3단, 어두운 CTA 띠.
// 예시의 숫자는 모두 지금 저장된 옷장으로 계산한다(지어낸 숫자 없음).
export function Landing() {
  const results = useLookResults();
  const garments = useGarments();
  const outfits = useOutfits();
  const shopping = useShopping();
  const looks = useLooks();
  const products = useMemo(() => productIndex(looks ?? []), [looks]);

  const example = results?.find((r) => r.look.id === EXAMPLE_LOOK) ?? results?.[0];

  // 피팅룸 예시: 예시 룩을 그대로 입힌 모습(가진 옷은 내 옷, 없는 옷은 쇼핑몰 상품)
  const worn: WornItem[] = (example?.items ?? []).flatMap((i): WornItem[] => {
    const slot = i.product.attrs.category;
    if (!isSlot(slot)) return [];
    return i.verdict !== 'none' && i.garment ? [{ slot, kind: 'garment', garment: i.garment }] : [{ slot, kind: 'product', product: i.product }];
  });

  // 쇼핑 리스트 예시: 예시 룩에 없는 옷 + 지금 쇼핑 리스트, 사면 완성되는 코디가 많은 순 2개
  const shopRows: ShoppingRow[] =
    results && outfits && shopping
      ? shoppingRows(
          [
            ...(example?.missing ?? []).filter((p) => !shopping.some((s) => s.productId === p.id)).map((p) => ({ productId: p.id, addedAt: '', status: 'wanted' as const })),
            ...shopping,
          ],
          products,
          results,
          outfits,
          'unlock',
        ).slice(0, 2)
      : [];

  // 옷장 예시: 사진이 있는 옷부터 6벌
  const closet: Garment[] = [...(garments ?? [])].sort((a, b) => Number(!!b.cutout) - Number(!!a.cutout)).slice(0, 6);

  return (
    <main className={styles.landing}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <h1 className={styles.h1}>
            있는 옷부터 맞춰 보고,
            <br />
            없는 옷만 산다.
          </h1>
          <p className={styles.lead}>마음에 드는 룩을 고르면 내 옷장과 한 벌씩 비교해요. 가진 옷은 아바타에 그대로 입혀 보고, 모자란 옷만 쇼핑몰로 연결해요.</p>
          <div className={styles.ctas}>
            <ButtonLink to="/register" className={styles.primary}>
              내 옷장 만들기
            </ButtonLink>
            <ButtonLink to="/explore" variant="text" className={styles.secondary}>
              룩 먼저 둘러보기
              <Icon name="arrowRight" size={16} />
            </ButtonLink>
          </div>
          <p className={styles.note}>가입 없이 시작해요. 옷장은 이 브라우저에 저장돼요.</p>
        </div>

        {example && (
          <section className={styles.compare} aria-label="예시: 룩과 내 옷장 비교">
            <div className={styles.comparePhoto}>
              <LookCover look={example.look} />
            </div>
            <div className={styles.compareBody}>
              <div>
                <div className={styles.kicker}>이 룩을 내 옷장과 비교하면</div>
                <div className={styles.lookTitle}>{example.look.title}</div>
              </div>
              <ProgressBar own={example.own} total={example.total} aside={missingText(example)} asideAccent={example.own === example.total} />
              <ul className={styles.items}>
                {example.items.map((i) => (
                  <li key={i.product.id} className={styles.item}>
                    <span className={styles.itemThumb}>
                      <GarmentThumb image={productImage(i.product)} category={i.product.attrs.category} colorHex={i.product.colorHex} alt="" inset={11} />
                    </span>
                    <span className={styles.itemText}>
                      <span className={styles.itemName}>{i.product.alias}</span>
                      {i.verdict === 'alt' && i.garment && <span className={styles.itemSub}>→ 내 {i.garment.alias}</span>}
                    </span>
                    <Verdict verdict={i.verdict} size="sm" />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </section>

      <section className={styles.band}>
        <div className={styles.bandInner}>
          <div className={styles.bandHead}>
            <h2 className={styles.h2}>
              옷장, 피팅룸, 쇼핑이
              <br />
              <span className={styles.desktopOnly}>한 화면에 나란히 있어요</span>
              <span className={styles.mobileOnly}>한 흐름으로 이어져요</span>
            </h2>
            <p className={[styles.bandLead, styles.desktopOnly].join(' ')}>왼쪽에서 내 옷을 꺼내 가운데 아바타에 입히고, 없는 옷은 오른쪽 쇼핑 리스트에 모여요.</p>
          </div>
          <div className={styles.cols}>
            <article className={styles.col}>
              <ColHead no="01" title="내 옷장" sub="가진 옷" />
              {closet.length > 0 ? (
                <div className={styles.closetGrid}>
                  {closet.map((g) => (
                    <span key={g.id} className={styles.closetTile}>
                      <GarmentThumb image={g.cutout} category={g.attrs.category} colorHex={g.colorHex} alt={g.alias} inset={g.cutout ? 10 : 20} />
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.colText}>아직 등록한 옷이 없어요.</p>
              )}
              <p className={styles.colText}>사진 한 장씩 올리면 배경을 지우고 종류와 색을 정리해요. 룩을 볼 때마다 이 옷장과 자동으로 비교돼요.</p>
            </article>
            <article className={[styles.col, styles.colStrong].join(' ')}>
              <ColHead no="02" title="피팅룸" sub="입혀 보기" />
              <div className={styles.avatar}>
                <Avatar items={worn} width={220} label="예시 아바타" />
              </div>
              <p className={styles.colText}>내 옷과 쇼핑몰 상품을 섞어 입혀 봐요. 아직 없는 옷에는 표시가 붙어서, 아바타가 그대로 장바구니가 돼요.</p>
            </article>
            <article className={styles.col}>
              <ColHead no="03" title="쇼핑 리스트" sub="없는 옷만" />
              <ul className={styles.shopList}>
                {shopRows.map((r) => (
                  <li key={r.product.id} className={styles.shopRow}>
                    <span className={styles.shopThumb}>
                      <GarmentThumb image={productImage(r.product)} category={r.product.attrs.category} colorHex={r.product.colorHex} alt="" inset={r.product.image ? 9 : 20} />
                    </span>
                    <span>
                      <span className={styles.itemName}>{r.product.alias}</span>
                      {r.count > 0 && <span className={styles.unlock}>사면 완성되는 코디 {r.count}개</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <p className={styles.colText}>많은 코디를 완성해 주는 옷이 위로 와요. 결제는 각 쇼핑몰에서 하고, 산 옷은 바로 옷장으로 옮겨요.</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.ctaWrap}>
        <div className={styles.cta}>
          <div>
            <h2 className={styles.ctaTitle}>옷장 정리부터 시작해 볼까요</h2>
            <p className={styles.ctaText}>옷 사진 한 장이면 돼요. 열 벌쯤 올리면 비교가 꽤 정확해져요.</p>
          </div>
          <ButtonLink to="/register" variant="inverse" className={styles.ctaButton}>
            첫 옷 등록하기
          </ButtonLink>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>Closet / Look · 개인 프로젝트</span>
          <span>룩 사진과 상품 정보의 권리는 각 쇼핑몰에 있어요.</span>
          <a href={SOURCE_URL} className={styles.source} target="_blank" rel="noopener noreferrer">
            소스 코드 (AGPL-3.0)
            <span className="visually-hidden"> (새 탭)</span>
          </a>
        </div>
      </footer>
    </main>
  );
}

function ColHead({ no, title, sub }: { no: string; title: string; sub: string }) {
  return (
    <div className={styles.colHead}>
      <span className={styles.no}>{no}</span>
      <h3 className={styles.h3}>{title}</h3>
      <span className={styles.colSub}>{sub}</span>
    </div>
  );
}

