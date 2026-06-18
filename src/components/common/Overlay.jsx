import { useEscapeKey } from './useEscapeKey.js';

/**
 * モーダル共通の背景オーバーレイ。背景クリック / Escape で閉じる。
 */
export default function Overlay({ open, onClose, children }) {
  useEscapeKey(open, onClose);
  if (!open) return null;
  return (
    <div
      className="overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
