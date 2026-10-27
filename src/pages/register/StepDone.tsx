import { useLiveQuery } from 'dexie-react-hooks';
import { Button, ButtonLink } from '../../components/Button';
import { GarmentThumb } from '../../components/GarmentThumb';
import { Icon } from '../../components/Icon';
import { db } from '../../db/db';
import { summarize } from '../../domain/garmentOptions';
import type { Garment } from '../../domain/types';
import styles from './StepDone.module.css';

// 3단계: 완료. 피팅룸에서 입혀보기 / 한 벌 더 등록
export function StepDone({ mobile, garment, onNext, queued }: { mobile: boolean; garment: Garment; onNext: () => void; queued: number }) {
  const count = useLiveQuery(() => db.garments.count());
  const a = garment.attrs;
  const actions = (
    <div className={mobile ? styles.fixed : styles.actions}>
      <ButtonLink to="/fitting" block={mobile}>
        피팅룸에서 입혀보기
      </ButtonLink>
      <Button variant="text" className={styles.again} onClick={onNext}>
        {queued > 0 ? `다음 사진 등록 (${queued}장 남음)` : '한 벌 더 등록'}
      </Button>
    </div>
  );
  return (
    <>
      <section className={mobile ? styles.mobile : styles.box}>
        <div className={styles.thumb}>
          <GarmentThumb image={garment.cutout} category={a.category} colorHex={garment.colorHex} alt={garment.alias} />
        </div>
        <div className={styles.info}>
          <div className={styles.done} role="status">
            <Icon name="check" size={14} strokeWidth={3} />
            옷장에 추가했어요
          </div>
          <h2 className={styles.alias}>{garment.alias}</h2>
          <div className={styles.meta}>{summarize(a.category, a.colorFamily, a.fit, a.seasons)}</div>
          {count !== undefined && <div className={styles.meta}>내 옷장 {count}벌</div>}
          {!mobile && actions}
        </div>
      </section>
      {mobile && actions}
    </>
  );
}
