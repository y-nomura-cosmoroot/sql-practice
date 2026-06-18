import { useEffect } from 'react';

/**
 * モーダルが開いている間だけ Escape キーで閉じられるようにする共通フック。
 */
export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onEscape]);
}
