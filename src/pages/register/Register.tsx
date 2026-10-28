import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModalTopBar } from '../../components/MobileTopBar';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { StepDetails } from './StepDetails';
import { StepDone } from './StepDone';
import { StepPhoto } from './StepPhoto';
import { useRegister, type Step } from './useRegister';
import styles from './Register.module.css';

const STEPS: { no: Step; label: string }[] = [
  { no: 1, label: '사진' },
  { no: 2, label: '정보 확인' },
  { no: 3, label: '완료' },
];

/** 돌아간 화면이 그려지면 '옷 등록' 버튼(모바일 상단 바의 +)에 포커스 */
function focusOpener(tries = 20) {
  const el = Array.from(document.querySelectorAll<HTMLElement>('[aria-label="옷 등록"], a[href$="/register"]')).find((x) => x.offsetParent !== null);
  if (el) el.focus();
  else if (tries > 0) setTimeout(() => focusOpener(tries - 1), 50);
}

export function Register() {
  const reg = useRegister();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  // 단계가 바뀌면 그 단계의 제목으로 포커스(누른 버튼이 사라지므로)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const h = body.current?.querySelector<HTMLElement>('h2');
    if (h) {
      h.tabIndex = -1;
      h.focus();
    }
  }, [reg.step]);

  // 모바일 전체 화면 모달: 열리면 안으로 포커스, Esc는 취소. 닫으면 열었던 '옷 등록' 버튼으로 포커스를 돌려준다.
  const cancel = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate('/closet');
    focusOpener();
  };
  useEffect(() => {
    if (!isMobile) return;
    root.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && cancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile]);

  const content = (
    <div ref={body} className={styles.body}>
      {reg.step === 1 && <StepPhoto mobile={isMobile} onFiles={reg.startWithFiles} onUrl={reg.startWithUrl} />}
      {reg.step === 2 && <StepDetails mobile={isMobile} reg={reg} />}
      {reg.step === 3 && reg.saved && <StepDone mobile={isMobile} garment={reg.saved} onNext={reg.next} queued={reg.queued} />}
    </div>
  );

  if (isMobile) {
    return (
      <div ref={root} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="register-title" className={styles.mobile}>
        <ModalTopBar title="옷 등록" titleId="register-title" step={reg.step} total={3} onCancel={cancel} />
        {content}
      </div>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>옷 등록</h1>
          <p className={styles.sub}>한 벌씩 올리면 옷장과 아바타에서 바로 쓸 수 있어요.</p>
        </div>
        <ol className={styles.steps} aria-label="등록 단계">
          {STEPS.map((s) => (
            <li
              key={s.no}
              aria-current={reg.step === s.no ? 'step' : undefined}
              className={[styles.stepItem, reg.step === s.no && styles.stepOn, reg.step > s.no && styles.stepDone].filter(Boolean).join(' ')}
            >
              <span>{s.no}</span>
              {s.label}
            </li>
          ))}
        </ol>
      </div>
      {content}
    </main>
  );
}
