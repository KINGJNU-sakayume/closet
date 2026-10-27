import { ModalTopBar } from '../components/MobileTopBar';
import { Page } from '../components/Page';
import styles from './Register.module.css';

// 3단계에서 사진 → 정보 확인 → 완료를 채운다.
export function Register() {
  return (
    <>
      <div className={styles.mobileOnly}>
        <ModalTopBar title="옷 등록" step={1} total={3} cancelTo="/closet" />
      </div>
      <Page width="narrow" title="옷 등록" />
    </>
  );
}
