/**
 * 1つのテーブルの設計カード（テーブル名・列・型・PK・FK の編集UI）。
 *
 * @param {{
 *   table: { name:string, columns:Array<{name:string,type:string,pk:boolean,ref:string}> },
 *   ti: number,
 *   columnPool: string[],
 *   otherTables: string[],
 *   typeOptions: string[],
 *   onRemoveTable:(ti:number)=>void,
 *   onAddColumn:(ti:number, col:string)=>void,
 *   onRemoveColumn:(ti:number, ci:number)=>void,
 *   onUpdateColumn:(ti:number, ci:number, patch:object)=>void,
 * }} props
 */
export default function TableCard({
  table,
  ti,
  columnPool,
  otherTables,
  typeOptions,
  onRemoveTable,
  onAddColumn,
  onRemoveColumn,
  onUpdateColumn,
}) {
  return (
    <div className="d-table">
      <div className="d-table-head">
        <span className="d-table-name">{table.name}</span>
        <button className="d-mini" onClick={() => onRemoveTable(ti)}>
          テーブル削除
        </button>
      </div>
      <div className="d-cols">
        <div className="d-col-head">
          <span>列名</span>
          <span>型</span>
          <span>主キー</span>
          <span>外部キー</span>
          <span />
        </div>

        {table.columns.length ? (
          table.columns.map((c, ci) => (
            <div className="d-col-row" key={c.name}>
              <span className="d-col-name">{c.name}</span>
              <select
                className="d-sel d-type"
                value={c.type}
                onChange={(e) => onUpdateColumn(ti, ci, { type: e.target.value })}
              >
                {typeOptions.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
              <label className="d-chk">
                <input
                  type="checkbox"
                  className="d-pk"
                  checked={c.pk}
                  onChange={(e) => onUpdateColumn(ti, ci, { pk: e.target.checked })}
                />
                PK
              </label>
              <select
                className="d-sel d-fk"
                value={c.ref}
                onChange={(e) => onUpdateColumn(ti, ci, { ref: e.target.value })}
              >
                <option value="">FK: なし</option>
                {otherTables.map((n) => (
                  <option key={n} value={n}>
                    FK→{n}
                  </option>
                ))}
              </select>
              <button className="d-col-del" title="列を削除" onClick={() => onRemoveColumn(ti, ci)}>
                ✕
              </button>
            </div>
          ))
        ) : (
          <div className="placeholder-hint">下から列を追加</div>
        )}

        <div className="d-addcol">
          <span className="lbl">列を追加</span>
          {columnPool.length ? (
            columnPool.map((c) => (
              <button key={c} className="d-pill" onClick={() => onAddColumn(ti, c)}>
                + {c}
              </button>
            ))
          ) : (
            <span className="placeholder-hint">候補なし</span>
          )}
        </div>
      </div>
    </div>
  );
}
