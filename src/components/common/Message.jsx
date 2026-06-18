/**
 * 操作結果メッセージ（ok / ng / err / info）。
 * @param {{ message: { kind:'ok'|'ng'|'err'|'info', text:string } | null }} props
 */
export default function Message({ message }) {
  if (!message) return null;
  return <div className={`msg msg-${message.kind}`}>{message.text}</div>;
}
