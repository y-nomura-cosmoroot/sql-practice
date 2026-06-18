import { useEffect, useRef, useState } from 'react';

/**
 * タブ切り替え（SQL・設計モード共通）。
 * flashSignal が変化すると、現在アクティブなタブを一度だけ点滅させる
 * （結果へ自動で切り替わったことを知らせる元アプリの演出を再現）。
 *
 * @param {{ tabs: Array<{key:string,label:string}>, active:string, onChange:(key:string)=>void, flashSignal?:number }} props
 */
export default function Tabs({ tabs, active, onChange, flashSignal = 0 }) {
  const [flashId, setFlashId] = useState(0);
  const prev = useRef(flashSignal);

  useEffect(() => {
    if (flashSignal === prev.current) return undefined;
    prev.current = flashSignal;
    setFlashId((id) => id + 1);
    const timer = setTimeout(() => setFlashId(0), 950);
    return () => clearTimeout(timer);
  }, [flashSignal]);

  return (
    <div className="tabs">
      {tabs.map((t) => {
        const isActive = t.key === active;
        const doFlash = isActive && flashId > 0;
        return (
          <button
            // flash 時に key を変えて要素を作り直し、CSS アニメーションを再生する。
            key={doFlash ? `${t.key}-f${flashId}` : t.key}
            className={`tab${isActive ? ' active' : ''}${doFlash ? ' flash' : ''}`}
            onClick={() => onChange(t.key)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
