import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { IconButton } from '../../components/IconButton';
import { TextField } from '../../components/TextField';
import { saveOutfit } from '../../db/actions';
import { itemName, SLOT_LABEL, SLOTS } from '../../domain/catalog';
import { useFocusNext } from '../../hooks/useFocusNext';
import type { Fitting } from './useFitting';
import styles from './WornPanel.module.css';

// 입은 옷 목록 = 장바구니. 쇼핑몰 상품은 쇼핑 리스트에 담고, 지금 조합은 코디로 저장한다.
export function WornPanel({ fit }: { fit: Fitting }) {
  const { cart } = fit;
  const [root, focusNext] = useFocusNext<HTMLDivElement>();
  return (
    <div className={styles.wrap} ref={root}>
      <ul className={styles.list} aria-label="입은 옷">
        {SLOTS.map((slot) => {
          const item = fit.items.find((i) => i.slot === slot);
          return (
            <li key={slot} className={styles.row}>
              <span className={styles.slot}>{SLOT_LABEL[slot]}</span>
              <span className={[styles.name, !item && styles.emptyName].filter(Boolean).join(' ')}>{item ? itemName(item) : '비어 있음'}</span>
              {item?.kind === 'product' && <span className={styles.shop}>쇼핑몰 상품</span>}
              {item && <IconButton icon="close" size={16} aria-label={`${SLOT_LABEL[slot]} 벗기`} onClick={() => fit.remove(slot)} className={styles.remove} />}
            </li>
          );
        })}
      </ul>
      <div className={styles.cart}>
        <div>
          <div className={styles.cartLabel}>장바구니</div>
          <div className={styles.cartText}>
            {cart.count > 0 ? `쇼핑몰 상품 ${cart.count}벌 · ${cart.allListed ? '쇼핑 리스트에 담겼어요' : '아직 없는 옷'}` : '전부 내 옷이에요'}
          </div>
        </div>
        {cart.count > 0 &&
          (cart.allListed ? (
            <Link to="/shopping" className={styles.toList}>
              쇼핑 리스트 보기
              <Icon name="arrowRight" size={16} />
            </Link>
          ) : (
            <Button
              variant="text"
              accent
              onClick={() => {
                focusNext('쇼핑 리스트 보기');
                void cart.listAll();
              }}
            >
              <Icon name="plus" size={14} />
              쇼핑 리스트에 담기
            </Button>
          ))}
      </div>
      <SaveOutfit fit={fit} />
    </div>
  );
}

export function SaveOutfit({ fit }: { fit: Fitting }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState<string>();
  const empty = fit.items.length === 0;

  const start = () => {
    setTitle(fit.result?.look.title ?? '');
    setSaved(undefined);
    setOpen(true);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fit.worn) return;
    const outfit = await saveOutfit(title.trim() || '내 코디', fit.worn);
    setSaved(outfit.title);
    setOpen(false);
  };

  if (open) {
    return (
      <form className={styles.save} onSubmit={submit}>
        <TextField label="코디 이름" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="예: 주말 캠퍼스" />
        <div className={styles.saveActions}>
          <Button type="submit">저장</Button>
          <Button variant="text" onClick={() => setOpen(false)}>
            취소
          </Button>
        </div>
      </form>
    );
  }
  return (
    <div className={styles.saveRow}>
      <Button variant="text" onClick={start} disabled={empty}>
        <Icon name="bookmark" size={16} />
        코디 저장
      </Button>
      {saved && (
        <span className={styles.saved} role="status">
          ‘{saved}’ 저장했어요 ·{' '}
          <Link to="/closet?tab=outfits" className={styles.toList}>
            내 코디 보기
          </Link>
        </span>
      )}
    </div>
  );
}
