import { useMemo, useState } from 'react';
import schema from '../../data/schema.json';
import DataTable from '../common/DataTable.jsx';
import Tabs from '../common/Tabs.jsx';

const TABS = [
  { key: 'schema', label: 'テーブル構成' },
  { key: 'sample', label: 'サンプルデータ' },
];

/**
 * 「テーブル構成」と「サンプルデータ」を横並びタブで切り替える。
 * テーブル構成ではテーブル名・列名がトークンとしてタップでき、
 * SQL 組み立てエリアの挿入位置に入る。
 */
export default function SchemaView({ db, onPick }) {
  const [activeTab, setActiveTab] = useState('schema');

  // サンプルデータは DB が用意できた時点で一度だけ取得する。
  const samples = useMemo(
    () =>
      schema.map((t) => {
        const r = db.exec(`SELECT * FROM ${t.name}`);
        return { name: t.name, result: r.length ? r[0] : null };
      }),
    [db]
  );

  return (
    <div>
      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="tab-body" style={{ display: activeTab === 'schema' ? 'block' : 'none' }}>
        {schema.map((t) => (
          <div className="schema-table" key={t.name}>
            <div className="schema-name-row">
              <button type="button" className="tok tb" onClick={() => onPick(t.name)}>
                {t.name}
              </button>
              <span className="schema-desc">{t.desc}</span>
            </div>
            <div className="schema-cols">
              {t.cols.map((c, i) => (
                <div className="schema-col-row" key={i}>
                  <button type="button" className="tok col" onClick={() => onPick(c.c)}>
                    {c.c}
                  </button>
                  <span className="muted">{c.t}</span>
                  {c.note ? <span className="muted">{c.note}</span> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="tab-body" style={{ display: activeTab === 'sample' ? 'block' : 'none' }}>
        {samples.map((s) =>
          s.result ? (
            <div key={s.name}>
              <div className="res-label">{s.name}</div>
              <DataTable columns={s.result.columns} values={s.result.values} />
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
