import { useParams } from 'react-router-dom';
import { Page } from '../components/Page';

// 4단계에서 옷장 패널 · 아바타 · 룩 상세 3단을 채운다.
export function Fitting() {
  const { lookId } = useParams();
  return (
    <Page width="full">
      <h1 className="visually-hidden">피팅룸{lookId ? ` · ${lookId}` : ''}</h1>
    </Page>
  );
}
