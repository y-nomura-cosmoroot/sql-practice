# SQL & DB Design Practice

部品（チップ）をタップして SQL を組み立てたり、要件からテーブル設計を組み立てて
判定したりできる学習アプリです。ブラウザ内で動く [sql.js](https://sql.js.org/)（SQLite/WASM）で
実際にクエリを実行します。文字入力は不要です。

元は単一の `sql-practice-app.html` でしたが、**Vite + React** に再構築し、
CSS を機能ごとに分割、問題・解答・ヒントなどのデータを JSON に外出ししています。

## 主な機能

左サイドバーの「SQL / 設計」をクリックするとモードが切り替わり、その配下に
問題一覧（番号＋レベル、例: `基本` `集計(SUM)`）が開きます。問題を選ぶと該当問題へ
移動します。正解した問題には ✓（緑）、答え合わせして不正解だった問題には ✗（赤）が付きます。
各モードは進捗表示（`正解: x / y`）・正誤ポップアップ・ヒント／解答例のポップアップを
備えています。

### SQL モード

- 基本 → WHERE → 並び替え → 集計 → グループ集計 → JOIN → サブクエリまで全 18 問。
- 2カラム構成：左「テーブル構成」（テーブル名・列名をタップで挿入できる＋サンプルデータ）、
  右「部品パレット」（キーワード・関数・記号・値）。どちらもタップで部品を挿入します。
- 画面下に固定された組み立てコンポーザーで SQL を組み立て。挿入は**カーソル位置**に入り、
  「挿入位置」コントロール（最初／◀／▶／最後）で位置を移動できます。チップをタップで削除。
- **▶ 実行**／**✓ 答え合わせ**（結果一致で判定）・**クリア**・**ヒント**・**解答例**。
- 実行・答え合わせの結果は**ポップアップ**でテーブル表示します。

### 設計モード

- 主キーと型・1 対多（外部キー）・多対多（中間テーブル）・第 3 正規形・第 1 正規形の全 5 問。
- 「テーブルを追加」「列を追加」で要素をタップ配置し、各列の型・主キー(PK)・外部キー(FK)を選択。
- **✓ 設計を判定**（テーブル／列／型／PK／FK／余分な要素を1項目ずつ判定）／
  **クリア**・**ヒント**・**模範解答**（操作ボタンは画面下に固定）。
- 右側は「設計プレビュー」タブと「判定結果」タブ。

## セットアップ

必要環境: Node.js 18 以上（Vite 6 / React 18）。

```bash
npm install
npm run dev      # 開発サーバー（http://localhost:5173）
npm run build    # 本番ビルド（dist/ に出力）
npm run preview  # ビルド結果をローカル確認
```

> sql.js 本体（WASM）は CDN から読み込みます。初回起動時はネットワーク接続が必要です。

## ディレクトリ構成

```text
src/
├─ main.jsx                エントリーポイント
├─ App.jsx                 全体シェル（ヘッダー＋サイドバー）・モード切替・問題状態・DB 初期化
├─ components/Sidebar.jsx  左サイドバー（モード切替＋問題一覧ナビ）
├─ data/                   ← 問題・解答・ヒント等のデータ（ここを編集すれば拡張できます）
│  ├─ setup.sql            サンプルDBの CREATE / INSERT
│  ├─ schema.json          テーブル構成の表示＋テーブル名・列名トークンのデータ
│  ├─ palette.json         部品パレット（キーワード・関数・記号・値）
│  ├─ typeOptions.json     設計モードで選べる型の一覧
│  ├─ sqlProblems.json     SQL 問題（問題文・ヒント・解答）
│  └─ designProblems.json  設計課題（問題文・ヒント・模範解答・判定基準）
├─ lib/                    純粋ロジック（副作用なし・テスト容易）
│  ├─ buildSql.js          トークン列 → SQL 文字列
│  ├─ compareResults.js    実行結果の一致判定
│  └─ checkDesign.js       設計の判定
├─ hooks/
│  ├─ useSqlDb.js          sql.js の初期化
│  └─ useProblemSet.js     問題番号・進捗・ナビゲーション（両モード共通）
├─ components/
│  ├─ common/              両モードで共有する UI（タブ・モーダル・結果テーブル・メッセージ等）
│  ├─ sql/                 SQL モード
│  └─ design/              設計モード
└─ styles/                 機能ごとに分割した CSS（index.css がまとめて読み込む）
```

## 問題を追加・編集するには

`src/data/` の JSON を編集するだけで問題を増やせます（コードの変更は不要）。

### SQL 問題（`sqlProblems.json`）

配列に 1 要素追加します。

```json
{
  "cls": "lv-basic",
  "levelLabel": "基本",
  "q": "問題文をここに書きます。",
  "hint": "ヒントの文章。",
  "answer": "SELECT ... ;"
}
```

| キー | 意味 |
| --- | --- |
| `cls` | レベルバッジの色クラス（`lv-basic` `lv-sort` `lv-agg` `lv-group` `lv-join` `lv-sub`） |
| `levelLabel` | バッジに表示するラベル |
| `q` | 問題文 |
| `hint` | 「ヒント」ボタンで表示する文章 |
| `answer` | 模範解答 SQL。実行結果を正解と照合します |

答え合わせは「SQL 文字列の一致」ではなく「**実行結果の一致**」で判定するため、
書き方が違っても結果が同じなら正解になります。`answer` の SQL で使うテーブル・列は
`setup.sql`（実データ）と `schema.json`（画面で選べるトークン）に存在している必要があります。

### 設計課題（`designProblems.json`）

```json
{
  "cls": "lv-d1",
  "levelLabel": "基本(主キーと型)",
  "q": "課題文。",
  "hint": "ヒント。",
  "tablePool": ["members", "orders"],
  "columnPool": { "members": ["member_id", "name", "email"] },
  "answer": {
    "members": [
      { "name": "member_id", "type": "INTEGER", "pk": true },
      { "name": "name", "type": "TEXT" }
    ]
  },
  "model": "members(member_id INTEGER PK, name TEXT)"
}
```

| キー | 意味 |
| --- | --- |
| `tablePool` | 「テーブルを追加」で選べるテーブル名（正解以外のダミーを混ぜると難度が上がる） |
| `columnPool` | テーブルごとに「列を追加」で選べる列名（ダミー列を混ぜられる） |
| `answer` | 模範解答。各列は `name` / `type` / `pk`(任意) / `ref`(任意, FK 先テーブル名) |
| `model` | 「模範解答」ボタンで表示するテキスト |

判定は `answer` を基準に、テーブル・列・型・主キー(PK)・外部キー(FK)・余分な列/テーブルを
チェックします（`src/lib/checkDesign.js`）。

### サンプルデータを変える

`src/data/setup.sql` の `CREATE TABLE` / `INSERT` を編集し、画面表示とテーブル名・列名の
トークンのために `schema.json` も合わせて更新してください（テーブル名・列名は「テーブル構成」
＝`schema.json` から選ぶため、`palette.json` には含めません）。
