import palette from '../../data/palette.json';

/**
 * SQL 部品パレット。ボタンをタップすると onPick でトークンを追加する。
 */
export default function Palette({ onPick }) {
  return (
    <div>
      {palette.map((group) => (
        <div className="pal-group" key={group.title}>
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
