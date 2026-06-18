/**
 * 「設計プレビュー」タブ。組み立て中のテーブル設計を一覧表示する。
 */
export default function DesignPreview({ design }) {
  if (!design.length) {
    return (
      <div className="placeholder-hint">テーブルを追加すると、ここに設計が表示されます。</div>
    );
  }
  return (
    <div>
      {design.map((t) => (
        <div className="d-preview-tbl" key={t.name}>
          <div className="d-preview-name">{t.name}</div>
          {t.columns.length ? (
            t.columns.map((c, i) => (
              <div className="d-preview-col" key={i}>
                {c.name} <span className="muted">{c.type}</span>
                {c.pk ? (
                  <>
                    {' '}
                    <span className="pktag">[PK]</span>
                  </>
                ) : null}
                {c.ref ? (
                  <>
                    {' '}
                    <span className="tag">[FK→{c.ref}]</span>
                  </>
                ) : null}
              </div>
            ))
          ) : (
            <div className="d-preview-col muted">(列なし)</div>
          )}
        </div>
      ))}
    </div>
  );
}
