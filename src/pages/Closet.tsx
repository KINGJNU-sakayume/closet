import { useSearchParams } from 'react-router-dom';
import { Page } from '../components/Page';
import { Segmented } from '../components/Segmented';

type Tab = 'items' | 'outfits';

// 6단계에서 옷 타일·코디 카드를 채운다.
export function Closet() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'outfits' ? 'outfits' : 'items';
  return (
    <Page width="wide" title="내 옷장">
      <Segmented
        mode="tabs"
        size="lg"
        label="내 옷장 보기"
        value={tab}
        onChange={(t) => setParams({ tab: t }, { replace: true })}
        options={[
          { value: 'items', label: '옷' },
          { value: 'outfits', label: '코디' },
        ]}
      />
    </Page>
  );
}
