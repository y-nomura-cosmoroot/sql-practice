/**
 * 配置されたトークン列を1本のSQL文字列に組み立てる。
 * 元アプリの buildSQL と同じ連結ルール:
 *  - ピリオド前後（テーブル.列）はスペースなしで連結
 *  - カンマ / セミコロン / 閉じ括弧 はスペースなしで直前に付く
 *  - 開き括弧、および開き括弧の直後はスペースなし
 *  - それ以外はスペース区切り
 */
export function buildSql(tokens) {
  let s = '';
  tokens.forEach((t, i) => {
    if (i === 0) {
      s += t;
      return;
    }
    const prev = tokens[i - 1];
    if (t === '.' || prev === '.') s += t;
    else if (t === ',' || t === ';' || t === ')') s += t;
    else if (t === '(') s += t;
    else if (prev === '(') s += t;
    else s += ' ' + t;
  });
  return s;
}
