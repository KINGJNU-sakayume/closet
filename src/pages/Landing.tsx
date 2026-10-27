import { ButtonLink } from '../components/Button';
import { Page } from '../components/Page';

// 8단계에서 히어로·비교 카드·3단 설명·CTA 띠를 채운다.
export function Landing() {
  return (
    <Page width="landing">
      <h1>있는 옷부터 맞춰 보고, 없는 옷만 산다.</h1>
      <div>
        <ButtonLink to="/explore">룩 둘러보기</ButtonLink>
      </div>
    </Page>
  );
}
