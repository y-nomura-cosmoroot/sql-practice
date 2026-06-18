// セル区切りには制御文字 U+0001 を使い、隣接セルの値が連結して
// 偽一致するのを防ぐ（元アプリと同じ）。
const SEP = String.fromCharCode(1);

/**
 * sql.js の実行結果同士（{ columns, values }）を、行順に依存せず比較する。
 * 元アプリの compareResults と同じロジック。
 */
export function compareResults(u, a) {
  if (u.values.length !== a.values.length) return false;
  if (u.columns.length !== a.columns.length) return false;
  const norm = (arr) =>
    arr
      .map((row) => row.map((v) => (v === null ? '∅' : String(v))).join(SEP))
      .sort();
  const us = norm(u.values);
  const as = norm(a.values);
  for (let i = 0; i < us.length; i++) {
    if (us[i] !== as[i]) return false;
  }
  return true;
}
