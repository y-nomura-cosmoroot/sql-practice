import DataTable from '../common/DataTable.jsx';

/**
 * 「あなたの結果」タブの中身。
 * @param {{ result: { label:string|null, table:{columns,values}|null, emptyText:string|null } | null }} props
 */
export default function ResultView({ result }) {
  if (!result) return null;
  return (
    <div>
      {result.label && <div className="res-label">{result.label}</div>}
      {result.table ? (
        <DataTable columns={result.table.columns} values={result.table.values} />
      ) : (
        result.emptyText && <div className="msg msg-info">{result.emptyText}</div>
      )}
    </div>
  );
}
