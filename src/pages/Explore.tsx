import { useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';

// 5단계에서 카드 그리드·정렬·필터를 채운다.
export function Explore() {
  const [params] = useSearchParams();
  return <Page width="wide" title={params.get('q') ?? '룩 탐색'} />;
}
