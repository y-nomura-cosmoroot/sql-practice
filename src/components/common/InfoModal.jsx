import Overlay from './Overlay.jsx';

/**
 * 情報ポップアップ（ヒント・解答例の表示。SQL・設計モード共通）。
 * @param {{ info: { title:string, kind:'hint'|'answer', text:string } | null, onClose:()=>void }} props
 */
export default function InfoModal({ info, onClose }) {
  return (
    <Overlay open={!!info} onClose={onClose}>
      <div className="modal info info-modal">
        <h3 className="info-modal-title">{info?.title}</h3>
        <div>
          {info?.kind === 'hint' ? (
            <div className="info-hint">💡 {info?.text}</div>
          ) : (
            <div className="info-code">{info?.text}</div>
          )}
        </div>
        <div className="modal-btns info-modal-btns">
          <button className="modal-close" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </Overlay>
  );
}
