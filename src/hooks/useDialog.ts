import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * 모달 대화상자: 열리면 안으로 포커스를 옮기고, Tab을 안에 가두고, Esc로 닫으면 열었던 요소로 포커스를 돌려준다.
 */
export function useDialog<T extends HTMLElement>(open: boolean, onClose: () => void, initialFocus?: () => HTMLElement | null) {
  const ref = useRef<T>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = ref.current;
    const first = initialFocus?.() ?? root?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close.current();
        return;
      }
      if (e.key !== 'Tab' || !root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const [a, z] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      // 열었던 요소가 아직 화면에 있으면 그리로 돌아간다
      if (opener && document.contains(opener)) opener.focus();
    };
    // initialFocus는 열릴 때 한 번만 쓴다
  }, [open]);

  return ref;
}
