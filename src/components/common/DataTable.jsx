/**
 * sql.js の実行結果 { columns, values } をテーブル表示する。
 */
export default function DataTable({ columns, values }) {
  return (
    <div className="table-scroll">
      <table className="data">
        <tbody>
          <tr>
            {columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
          {values.map((row, ri) => (
            <tr key={ri}>
              {row.map((v, ci) => (
                <td key={ci}>{v === null ? <span className="muted">NULL</span> : String(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
