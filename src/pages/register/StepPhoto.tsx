import { useRef, useState, type DragEvent, type FormEvent } from 'react';
import { Button } from '../../components/Button';
import { Icon, type IconName } from '../../components/Icon';
import { TextField } from '../../components/TextField';
import { assetUrl } from '../../domain/looks';
import styles from './StepPhoto.module.css';

interface Props {
  mobile: boolean;
  onFiles: (files: Blob[]) => void;
  onUrl: (url: string) => void;
}

const isHttpUrl = (v: string) => {
  try {
    return /^https?:$/.test(new URL(v).protocol);
  } catch {
    return false;
  }
};

const images = (list: FileList | null) => Array.from(list ?? []).filter((f) => f.type.startsWith('image/'));

// 1단계: 사진 올리기 또는 상품 주소 남기기
export function StepPhoto({ mobile, onFiles, onUrl }: Props) {
  const album = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [linkOpen, setLinkOpen] = useState(false);

  const pick = (list: FileList | null) => {
    const files = images(list);
    if (files.length) onFiles(files);
  };

  const submitUrl = (e: FormEvent) => {
    e.preventDefault();
    const v = url.trim();
    if (!isHttpUrl(v)) return setUrlError('https://로 시작하는 상품 주소를 넣어 주세요.');
    onUrl(v);
  };

  const sample = async () => {
    const res = await fetch(assetUrl('assets/tee_original.png'));
    onFiles([await res.blob()]);
  };

  const inputs = (
    <>
      <input ref={album} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e.target.files)} data-testid="photo-input" />
      <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files)} />
    </>
  );

  const linkForm = (
    <form className={styles.linkForm} onSubmit={submitUrl} noValidate>
      <TextField
        label="상품 주소"
        type="url"
        inputMode="url"
        placeholder="https://"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setUrlError('');
        }}
        aria-invalid={!!urlError}
        hint={urlError || undefined}
      />
      <Button type="submit" variant={mobile ? 'primary' : 'text'} className={mobile ? undefined : styles.outline}>
        주소로 등록
      </Button>
    </form>
  );

  const tips = (
    <>
      <li>옷 한 벌만, 평평한 바닥이나 옷걸이에 걸어서 찍어요.</li>
      <li>배경은 단색일수록 좋아요. 사람이 입은 사진은 배경 제거가 잘 안 돼요.</li>
      <li>옷 전체가 잘리지 않게 담아요.</li>
    </>
  );

  if (mobile) {
    const row = (icon: IconName, title: string, desc: string, onClick: () => void, expanded?: boolean) => (
      <button type="button" className={styles.row} onClick={onClick} aria-expanded={expanded}>
        <Icon name={icon} size={24} strokeWidth={1.6} />
        <span className={styles.rowText}>
          <span className={styles.rowTitle}>{title}</span>
          <span className={styles.rowDesc}>{desc}</span>
        </span>
        <Icon name="chevronRight" />
      </button>
    );
    return (
      <div className={styles.mobile}>
        {inputs}
        <h2 className={styles.mTitle}>
          옷 사진을
          <br />
          올려 주세요
        </h2>
        <p className={styles.mLead}>배경을 지우고 종류와 색을 정리해서 옷장에 넣어요.</p>
        <div className={styles.rows}>
          {row('camera', '사진 찍기', '바닥에 펼치거나 옷걸이에 걸고 찍어요', () => camera.current?.click())}
          {row('image', '앨범에서 고르기', '여러 장을 한 번에 올릴 수 있어요', () => album.current?.click())}
          {row('link', '상품 링크로 등록', '쇼핑몰 주소를 구매처로 남겨요', () => setLinkOpen((v) => !v), linkOpen)}
        </div>
        {linkOpen && linkForm}
        <h3 className={styles.tipTitle}>잘 되는 사진</h3>
        <ul className={styles.tips}>{tips}</ul>
        <Button variant="text" className={styles.sample} onClick={sample}>
          예시 사진으로 이어서 해보기
          <Icon name="arrowRight" size={16} />
        </Button>
      </div>
    );
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    pick(e.dataTransfer.files);
  };

  return (
    <>
      {inputs}
      <div className={styles.cols}>
        <section
          className={[styles.drop, drag && styles.dropOn].filter(Boolean).join(' ')}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          aria-label="사진 올리기"
        >
          <span className={styles.dropIcon}>
            <Icon name="upload" size={40} strokeWidth={1.5} />
          </span>
          <div>
            <div className={styles.dropTitle}>옷 사진을 끌어다 놓으세요</div>
            <div className={styles.dropSub}>한 번에 여러 장도 괜찮아요</div>
          </div>
          <Button onClick={() => album.current?.click()}>사진 선택</Button>
        </section>
        <section className={styles.linkBox}>
          <h2 className={styles.h2}>상품 링크로 등록</h2>
          <p className={styles.linkSub}>쇼핑몰 상품 주소를 구매처로 남겨 두고, 종류와 색은 다음 단계에서 정해요. 사진은 나중에 올려도 돼요.</p>
          {linkForm}
        </section>
      </div>
      <section className={styles.tipBox}>
        <h2 className={styles.tipH}>잘 되는 사진</h2>
        <ul className={styles.tips}>{tips}</ul>
      </section>
      <div>
        <Button variant="text" className={styles.sample} onClick={sample}>
          예시 사진으로 이어서 해보기
          <Icon name="arrowRight" size={16} />
        </Button>
      </div>
    </>
  );
}
