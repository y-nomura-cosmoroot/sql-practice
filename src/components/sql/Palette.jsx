import palette from '../../data/palette.json';

/**
 * SQL 部品パレット。ボタンをタップすると onPick でトークンを挿入する。
 * extraGroups は問題ごとの追加部品（例: INSERT 問題の値）で、基本パレットの後に並べる。
 */
export default function Palette({ onPick, extraGroups = [] }) {
  const groups = [...palette, ...extraGroups];
  return (
    <div>
      {groups.map((group, gi) => (
        <div className="pal-group" key={gi}>
          <div className="pal-title">{group.title}</div>
          <div className="pal-items">
            {group.items.map((item, i) => (
              <button key={i} className={`tok ${group.cls}`} onClick={() => onPick(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
