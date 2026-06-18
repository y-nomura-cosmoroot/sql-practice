import { useCallback, useState } from 'react';

/**
 * SQL モード・設計モードで共通の「問題セット」状態を扱うフック。
 * 現在の問題番号、解いた問題の記録、ナビゲーションをまとめて提供する。
 *
 * @param {number} total 問題数
 */
export function useProblemSet(total) {
  const [current, setCurrent] = useState(0);
  const [solved, setSolved] = useState({});

  const solvedCount = Object.keys(solved).length;

  const goTo = useCallback((i) => setCurrent(i), []);

  const markSolved = useCallback(
    (i) => setSolved((s) => (s[i] ? s : { ...s, [i]: true })),
    []
  );

  // 現在位置の次にある未解決の問題へ移動する（全問解決済みなら次の問題へ）。
  const nextUnsolved = useCallback(() => {
    let n = current;
    do {
      n = (n + 1) % total;
    } while (solved[n] && n !== current);
    setCurrent(n);
  }, [current, solved, total]);

  return { current, solved, solvedCount, total, goTo, markSolved, nextUnsolved };
}
