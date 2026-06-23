import Overlay from './Overlay.jsx';

/**
 * SQLite（本アプリの実行エンジン = sql.js）と Oracle で書き方が異なる主な点。
 * ここに行を足すだけで「違い」表が増える（DRY）。
 */
const ORACLE_DIFFS = [
  {
    topic: '行数の制限',
    oracle: 'WHERE ROWNUM <= 10 ／ FETCH FIRST 10 ROWS ONLY',
    sqlite: 'LIMIT 10 ／ LIMIT 10 OFFSET 5（n件スキップ）',
  },
  {
    topic: 'ダミー表',
    oracle: 'SELECT 1 FROM DUAL',
    sqlite: 'SELECT 1（FROM 不要。DUAL は存在しない）',
  },
  {
    topic: 'NULL の補完',
    oracle: 'NVL(col, 0) ／ NVL2(col, a, b)',
    sqlite: 'IFNULL(col, 0) ／ COALESCE(col, 0)',
  },
  {
    topic: '条件分岐',
    oracle: 'DECODE(col, 1, "A", 2, "B", "他")',
    sqlite: 'CASE col WHEN 1 THEN ... END（DECODE なし）',
  },
  {
    topic: '空文字列と NULL',
    oracle: "'' は NULL として扱われる",
    sqlite: "'' と NULL は別物（'' は長さ0の文字列）",
  },
  {
    topic: '集合演算（差）',
    oracle: 'A MINUS B',
    sqlite: 'A EXCEPT B（MINUS は使えない）',
  },
  {
    topic: '外部結合（旧構文）',
    oracle: 'WHERE a.id = b.id(+)',
    sqlite: 'LEFT JOIN ... ON（(+) 構文は使えない）',
  },
  {
    topic: '現在日時',
    oracle: 'SYSDATE ／ SYSTIMESTAMP',
    sqlite: "date('now') ／ datetime('now')",
  },
  {
    topic: '日付の書式・計算',
    oracle: 'TO_DATE / TO_CHAR / ADD_MONTHS、DATE 型',
    sqlite: "strftime('%Y-%m', d)、日付は TEXT('2024-01-15') で保持",
  },
  {
    topic: '型変換',
    oracle: 'TO_CHAR(num) ／ TO_NUMBER(str)',
    sqlite: 'CAST(num AS TEXT) ／ CAST(str AS INTEGER)',
  },
  {
    topic: 'データ型',
    oracle: 'VARCHAR2 / NUMBER / DATE / CLOB',
    sqlite: 'TEXT / INTEGER / REAL（動的型付け・型名は緩い）',
  },
  {
    topic: '自動採番',
    oracle: 'シーケンス（seq.NEXTVAL）／ IDENTITY',
    sqlite: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  },
  {
    topic: '文字埋め',
    oracle: 'LPAD(s, 5, "0") ／ RPAD',
    sqlite: "printf('%05d', n) など（LPAD/RPAD なし）",
  },
  {
    topic: '階層問い合わせ',
    oracle: 'CONNECT BY ... START WITH',
    sqlite: 'WITH RECURSIVE（再帰 CTE）',
  },
  {
    topic: '正規表現',
    oracle: 'REGEXP_LIKE / REGEXP_SUBSTR',
    sqlite: 'LIKE / GLOB で代替（REGEXP は既定で未登録）',
  },
];

/**
 * このサイトの使い方＋SQLite と Oracle の違いを表示するヘルプモーダル。
 * @param {{ open:boolean, onClose:()=>void }} props
 */
export default function HelpModal({ open, onClose }) {
  return (
    <Overlay open={open} onClose={onClose}>
      <div className="modal info help-modal">
        <h3 className="info-modal-title">このサイトの使い方</h3>

        <div className="help-body">
          <section className="help-section">
            <h4>このアプリについて</h4>
            <p>
              文字入力なしで、画面の部品（チップ）をタップして SQL を組み立てたり、
              要件からテーブルを設計したりして、その場で判定できる学習アプリです。
              SQL はブラウザ内の <strong>SQLite（sql.js / WASM）</strong> で実際に実行します。
            </p>
          </section>

          <section className="help-section">
            <h4>基本操作</h4>
            <ul>
              <li>左サイドバーで <strong>「SQL」「設計」</strong> のモードを切り替え、問題を選びます。</li>
              <li>正解した問題には <span className="help-ok">✓</span>、不正解だった問題には <span className="help-ng">✗</span> が付きます。</li>
              <li>進捗（正解: x / y）と、正誤・ヒント・解答例はポップアップで表示されます。</li>
            </ul>
          </section>

          <section className="help-section">
            <h4>SQL モード</h4>
            <ul>
              <li>左「テーブル構成」（テーブル名・列名）と右「部品パレット」（キーワード・関数・記号・値）をタップして挿入します。</li>
              <li>画面下のコンポーザーで組み立て。挿入は<strong>カーソル位置</strong>に入り、チップのタップで削除できます。</li>
              <li><strong>▶ 実行</strong>／<strong>✓ 答え合わせ</strong>／クリア／ヒント／解答例。判定は<strong>実行結果の一致</strong>なので、書き方が違っても結果が同じなら正解です。</li>
              <li>INSERT などの更新系はトランザクション内で実行し ROLLBACK するため、サンプル DB は変化しません。</li>
            </ul>
          </section>

          <section className="help-section">
            <h4>設計モード</h4>
            <ul>
              <li>「テーブルを追加」「列を追加」で要素を配置し、各列の型・主キー(PK)・外部キー(FK)を選びます。</li>
              <li><strong>✓ 設計を判定</strong>で、テーブル／列／型／PK／FK／余分な要素を1項目ずつチェックします。</li>
              <li>右側で「設計プレビュー」と「判定結果」を切り替えられます。</li>
            </ul>
          </section>

          <section className="help-section help-warn">
            <h4>⚠ SQLite と Oracle の違いに注意</h4>
            <p>
              本アプリの実行エンジンは <strong>SQLite</strong> です。SQL の標準的な部分（SELECT / WHERE /
              JOIN / GROUP BY / 集計関数など）は Oracle と同じですが、
              <strong>方言（書き方）が異なる箇所</strong>があります。代表は行数を絞る <code>ROWNUM</code> で、
              SQLite では使えず <code>LIMIT</code> を使います。主な違いは下表のとおりです。
            </p>
            <div className="help-diff-wrap">
              <table className="help-diff">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>Oracle</th>
                    <th>このアプリ（SQLite）</th>
                  </tr>
                </thead>
                <tbody>
                  {ORACLE_DIFFS.map((d) => (
                    <tr key={d.topic}>
                      <th scope="row">{d.topic}</th>
                      <td>{d.oracle}</td>
                      <td>{d.sqlite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="help-note">
              ※ 上記以外にも細かな差異があります。このアプリの問題は SQLite の書き方で出題・判定しています。
            </p>
          </section>
        </div>

        <div className="modal-btns info-modal-btns">
          <button className="modal-close" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </Overlay>
  );
}
