import { useRef, useState, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { GarmentThumb, useObjectUrl } from '../../components/GarmentThumb';
import { Segmented } from '../../components/Segmented';
import { Optional, TextField } from '../../components/TextField';
import { CATEGORY_OPTIONS, COLOR_OPTIONS, colorHex, FIT_OPTIONS, SEASON_OPTIONS } from '../../domain/garmentOptions';
import type { Category, Fit } from '../../domain/types';
import { aliasOf, type useRegister } from './useRegister';
import styles from './StepDetails.module.css';

type Reg = ReturnType<typeof useRegister>;
type PreviewBg = 'stage' | 'tile' | 'white';

const BG_OPTIONS: { value: PreviewBg; label: string }[] = [
  { value: 'stage', label: '아바타 배경' },
  { value: 'tile', label: '옷장 타일' },
  { value: 'white', label: '흰색' },
];

// 2단계: 배경 제거 결과 확인 + 종류·색·핏·계절·별칭·원본 상품명
export function StepDetails({ mobile, reg }: { mobile: boolean; reg: Reg }) {
  const { draft, update, processing } = reg;
  const [bg, setBg] = useState<PreviewBg>('stage');
  const [showOriginal, setShowOriginal] = useState(false);
  const originalUrl = useObjectUrl(draft.original);
  const photoInput = useRef<HTMLInputElement>(null);
  const working = processing.state === 'working';
  const alias = aliasOf(draft);

  const status =
    processing.state === 'working' ? (
      <div className={styles.status} role="status">
        <div className={styles.statusTitle}>배경을 지우는 중이에요</div>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} style={{ width: `${Math.round(processing.ratio * 100)}%` }} />
        </div>
        <div className={styles.note}>
          {processing.phase === 'download' ? '처음 한 번은 배경 제거 모델(약 56MB)을 내려받아요. 다음부터는 바로 돼요.' : '옷 테두리를 찾고 있어요.'}
        </div>
      </div>
    ) : processing.state === 'error' ? (
      <div className={styles.status} role="alert">
        <div className={styles.statusTitle}>배경을 지우지 못했어요</div>
        <div className={styles.note}>{processing.message}</div>
        <div className={styles.row}>
          {draft.original && (
            <Button variant="text" onClick={() => reg.addPhoto(draft.original!)}>
              다시 시도
            </Button>
          )}
          <Button variant="text" onClick={reg.keepOriginal}>
            원본 그대로 쓰기
          </Button>
        </div>
      </div>
    ) : null;

  const thumb = (
    <GarmentThumb image={draft.cutout} category={draft.category} colorHex={colorHex(draft.color)} alt={draft.cutout ? '배경을 지운 결과' : '사진 없는 옷 모양'} inset={6} />
  );

  const noPhoto = !draft.original && (
    <div className={styles.noPhoto}>
      <input ref={photoInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && reg.addPhoto(e.target.files[0])} />
      <p className={styles.note}>사진이 없으면 옷 모양에 고른 색을 칠해 보여 줘요.</p>
      <Button variant="text" onClick={() => photoInput.current?.click()}>
        사진 올리기
      </Button>
    </div>
  );

  const preview = mobile ? (
    <div className={[styles.mPreview, styles[showOriginal ? 'white' : 'tile']].join(' ')}>
      {status ??
        (showOriginal && originalUrl ? <img src={originalUrl} alt="원본 사진" className={styles.mImg} /> : <div className={styles.mImg}>{thumb}</div>)}
      {!status && draft.original && (
        <div className={styles.mCaption}>
          <span>{showOriginal ? '원본 사진' : '배경을 지웠어요'}</span>
          <Button variant="text" onClick={() => setShowOriginal((v) => !v)}>
            {showOriginal ? '결과 보기' : '원본 보기'}
          </Button>
        </div>
      )}
      {noPhoto}
    </div>
  ) : (
    <section className={styles.left}>
      <h2 className={styles.h2}>{draft.original ? '배경을 지웠어요' : '옷 모양 미리보기'}</h2>
      {draft.original ? (
        <div className={styles.pair}>
          <figure className={styles.figure}>
            <div className={[styles.frame, styles.white].join(' ')}>{originalUrl && <img src={originalUrl} alt="원본 사진" className={styles.img} />}</div>
            <figcaption>원본</figcaption>
          </figure>
          <figure className={styles.figure}>
            <div className={[styles.frame, styles[bg]].join(' ')}>{status ?? thumb}</div>
            <figcaption>배경 제거 결과</figcaption>
          </figure>
        </div>
      ) : (
        <div className={[styles.frame, styles.single, styles[bg]].join(' ')}>{thumb}</div>
      )}
      <div className={styles.bgRow}>
        <span className={styles.bgLabel}>미리보기 배경</span>
        <Segmented size="sm" label="미리보기 배경" value={bg} onChange={setBg} options={BG_OPTIONS} />
      </div>
      {draft.original ? <p className={styles.note}>가장자리가 어색하면 다른 사진으로 다시 올려 주세요. 이 이미지가 아바타에 겹쳐 입혀져요.</p> : noPhoto}
    </section>
  );

  const fieldset = (legend: ReactNode, children: ReactNode) => (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );

  const form = (
    <section className={styles.right}>
      {!mobile && <h2 className={styles.h2}>정보 확인</h2>}
      {fieldset(
        '종류',
        <Segmented
          label="종류"
          scroll
          value={draft.category}
          onChange={(v: Category) => update({ category: v })}
          options={CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
        />,
      )}
      {fieldset(
        '색',
        <Segmented
          label="색"
          size="sm"
          scroll
          value={draft.color}
          onChange={(v) => update({ color: v, colorPicked: true })}
          options={COLOR_OPTIONS.map((c) => ({ value: c.value, label: c.value, swatch: c.hex }))}
        />,
      )}
      {fieldset('핏', <Segmented label="핏" scroll value={draft.fit} onChange={(v: Fit) => update({ fit: v })} options={FIT_OPTIONS} />)}
      {fieldset(
        <>
          계절 <Optional>(여러 개 선택)</Optional>
        </>,
        <div className={styles.seasons}>
          {SEASON_OPTIONS.map((s) => (
            <Checkbox
              key={s.value}
              checked={draft.seasons.includes(s.value)}
              onChange={(on) => update({ seasons: on ? [...draft.seasons, s.value] : draft.seasons.filter((x) => x !== s.value) })}
            >
              {s.label}
            </Checkbox>
          ))}
        </div>,
      )}
      <TextField
        label="내 옷장에서 부를 이름"
        value={alias}
        onChange={(e) => update({ alias: e.target.value })}
        hint="종류와 색으로 만든 제안이에요. 직접 고칠 수 있어요."
      />
      <TextField
        label={
          <>
            원본 상품명 <Optional />
          </>
        }
        value={draft.sourceTitle}
        onChange={(e) => update({ sourceTitle: e.target.value })}
        hint="룩과 비교할 때 같은 상품인지 확인하는 데 써요."
      />
      {draft.sourceUrl && (
        <TextField
          label="상품 주소"
          type="url"
          value={draft.sourceUrl}
          onChange={(e) => update({ sourceUrl: e.target.value })}
          hint="구매처 링크로 저장돼요."
        />
      )}
      {!mobile && (
        <div className={styles.actions}>
          <Button variant="text" onClick={reg.restart}>
            다시 올리기
          </Button>
          <Button onClick={reg.save} disabled={working || draft.seasons.length === 0}>
            옷장에 추가
          </Button>
        </div>
      )}
      {draft.seasons.length === 0 && <p className={styles.note}>계절을 하나 이상 골라 주세요.</p>}
    </section>
  );

  if (mobile) {
    return (
      <>
        <div className={styles.mBody}>
          {preview}
          <div className={styles.mForm}>{form}</div>
        </div>
        <div className={styles.fixed}>
          <Button block onClick={reg.save} disabled={working || draft.seasons.length === 0}>
            옷장에 추가
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className={styles.cols}>
      {preview}
      {form}
    </div>
  );
}
