/**
 * ユーザーが組み立てた設計 (design) を模範解答 (answer) と突き合わせ、
 * 判定項目の配列と全体の合否を返す。元アプリの checkDesign のロジックを
 * 副作用なしの純粋関数として切り出したもの。
 *
 * @param {Array<{name:string, columns:Array<{name:string,type:string,pk?:boolean,ref?:string}>}>} design
 * @param {Object<string, Array<{name:string,type:string,pk?:boolean,ref?:string}>>} answer
 * @returns {{ checks: Array<[boolean, string]>, allOk: boolean }}
 */
export function checkDesign(design, answer) {
  const userMap = {};
  design.forEach((t) => {
    userMap[t.name.toLowerCase()] = t;
  });

  const checks = [];
  let allOk = true;

  Object.keys(answer).forEach((tn) => {
    const ut = userMap[tn.toLowerCase()];
    if (!ut) {
      checks.push([false, `テーブル「${tn}」が必要です`]);
      allOk = false;
      return;
    }
    checks.push([true, `テーブル「${tn}」がある`]);

    answer[tn].forEach((ec) => {
      const uc = ut.columns.find((c) => c.name.toLowerCase() === ec.name.toLowerCase());
      if (!uc) {
        checks.push([false, `${tn}.${ec.name} 列が必要です`]);
        allOk = false;
        return;
      }
      const tOk = uc.type === ec.type;
      const pOk = !!uc.pk === !!ec.pk;
      const ecref = (ec.ref || '').toLowerCase();
      const ucref = (uc.ref || '').toLowerCase();
      const fOk = ecref === ucref;

      if (tOk && pOk && fOk) {
        checks.push([
          true,
          `${tn}.${ec.name}（${ec.type}${ec.pk ? ' PK' : ''}${ec.ref ? ` FK→${ec.ref}` : ''}）OK`,
        ]);
      } else {
        if (!tOk) {
          checks.push([false, `${tn}.${ec.name} の型は ${ec.type} が適切（現在 ${uc.type}）`]);
          allOk = false;
        }
        if (!pOk) {
          checks.push([false, `${tn}.${ec.name} は${ec.pk ? '主キー(PK)にする' : '主キーにしない'}`]);
          allOk = false;
        }
        if (!fOk) {
          checks.push([
            false,
            `${tn}.${ec.name} は${ec.ref ? `「${ec.ref}」への外部キー(FK)` : '外部キーなし'}が適切`,
          ]);
          allOk = false;
        }
      }
    });

    ut.columns.forEach((uc) => {
      if (!answer[tn].find((ec) => ec.name.toLowerCase() === uc.name.toLowerCase())) {
        checks.push([false, `${tn}.${uc.name} は不要な列です`]);
        allOk = false;
      }
    });
  });

  design.forEach((t) => {
    if (!Object.keys(answer).find((tn) => tn.toLowerCase() === t.name.toLowerCase())) {
      checks.push([false, `テーブル「${t.name}」は不要（正規化の観点で見直しを）`]);
      allOk = false;
    }
  });

  return { checks, allOk };
}
