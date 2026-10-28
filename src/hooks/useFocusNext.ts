import { useCallback, useEffect, useRef } from 'react';

/**
 * 누른 버튼이 다른 버튼·링크로 바뀌면 포커스가 사라진다. 바뀐 뒤 같은 영역에서 글자가 `label`로 시작하는
 * 버튼·링크로 포커스를 옮긴다(저장소가 바뀌어 다시 그려질 때까지 기다린다).
 */
export function useFocusNext<T extends HTMLElement>() {
  const root = useRef<T>(null);
  const want = useRef<string | null>(null);
  useEffect(() => {
    if (!want.current || !root.current) return;
    const label = want.current;
    const el = Array.from(root.current.querySelectorAll<HTMLElement>('button, a[href]')).find((b) => (b.getAttribute('aria-label') ?? b.textContent ?? '').trim().startsWith(label));
    if (el) {
      el.focus();
      want.current = null;
    }
  });
  const focusNext = useCallback((label: string) => {
    want.current = label;
  }, []);
  return [root, focusNext] as const;
}
