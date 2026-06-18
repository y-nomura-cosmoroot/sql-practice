# CLAUDE.md — Claude 開発オンボーディング

このファイルは Claude Code が本リポジトリで作業するときに最初に読む内部メモ。
ユーザ向け仕様は [README.md](README.md) を参照。重複は避ける。

**領域固有ルールは [.claude/rules/](.claude/rules/) 配下の各 md に `paths:` frontmatter 付きで
分離**してあり、該当パスを編集するときに Claude Code が自動でロードする。
このファイルには全タスク共通の核だけを置く。

## 言語設定

**重要**: すべての回答、処理途中の出力、説明は日本語で行うこと。

## Git操作の制限

**絶対禁止**: git commit、git pushのgit操作は一切行わないこと。

- コミットメッセージの生成や提案は可能
- 実際のコミット・pushの実行は禁止

## コード設計原則：DRY（Don't Repeat Yourself）

**必須**: 定数、設定値、種類の定義は**一箇所で集中管理**すること。

### 禁止事項

- 同じ文字列リテラルを複数箇所に直書きしない
- if文やmatch文で種類を判定する際、文字列を直接書かない
- 新しい種類を追加する際、複数ファイルに同じ値を書かない

## プロジェクト要点

ブラウザ内で完結する **SQL / DB設計の学習アプリ**。旧 `sql-practice-app.html`（単一HTML）を
**Vite + React 18** に再構築したもの。ユーザは文字入力せず、部品をタップして SQL を組み立て／
テーブルを設計し、その場で判定する。ユーザ向けの使い方・問題の追加方法は [README.md](README.md)。

- **2モード**: `SQL`（部品から SQL を組み立て）と `設計`（テーブル設計）。左サイドバーで
  モード切替＋問題選択（選択中モードの問題一覧だけを展開表示）。
- **DB**: [sql.js](https://sql.js.org/)（SQLite/WASM）を CDN から動的ロード（`src/hooks/useSqlDb.js`）。
  初回起動はネット接続が必須。
- **判定は「実行結果の一致」**（重要な暗黙ルール）: SQL の答え合わせは文字列比較ではなく、
  ユーザSQLと模範解答SQLの**実行結果**を行順非依存で比較する（`src/lib/compareResults.js`）。
  書き方が違っても結果が同じなら正解。設計の判定は `src/lib/checkDesign.js`。
- **データは外出し**: 問題・解答・ヒント・設計課題・サンプルDB は `src/data/` の JSON と
  `setup.sql` に集約。問題追加はコード変更不要（パレットの列・テーブル名は `setup.sql` と整合させる）。
- **純粋ロジックは `src/lib/`**（`buildSql` / `compareResults` / `checkDesign`、副作用なし）、
  **共通UIは `src/components/common/`**、**CSSは機能別に `src/styles/*.css`** へ分割し `index.css` が集約。
- **状態は `App.jsx` に集約**: `useProblemSet` を2モード分持ち上げ、サイドバー（ナビ）と
  各モード（中身）で共有する。
- 変更後は `npm run build` が通ることを確認（ビルドが構文・import の最終ゲート）。

## 繰り返す調査は skill に

「ID X と Y はなぜ統合されないか」のような何度もやる調査は [.claude/skills/](.claude/skills/)
にまとめること。Claude Code 側からは `/<skill-name>` で呼べる:

例

| skill | 用途 |
|---|---|
| `diagnose-id-merge` | ID X と Y が統合された/されない理由を merges.json + samples + bank から自動生成 |
| `trace-id-decisions` | 特定 pid の判定経過を decisions.jsonl から時系列で抜粋 |

新しい調査タイプを 2 回以上やったら skill 化を検討すること。

## CLAUDE.md / rules / skills を育てるルール

このファイル・[.claude/rules/](.claude/rules/)・[.claude/skills/](.claude/skills/) は **書きっぱなしにせず、
作業のたびに更新を提案する**。Claude は次のタイミングで「学びを書き残すか」をユーザに**必ず確認する**:

| トリガー | 確認内容 |
|---|---|
| **問題が解決した直後** | 今回ハマった落とし穴・回避策・暗黙ルールがあれば、どこに書くか提案する |
| **コミット直前**（`/commit` 系の前） | 今回の変更で新しいルール / 繰り返し作業 / 引っかかるポイントが生まれていないか確認し、あれば書き残しを提案する |
| **同じ調査・修正を 2 回やった** | 2 回目に気付いた時点で skill 化を提案する（3 回目を待たない） |
| **既存の rules / skills の記述が現実と食い違った** | 該当ファイルの更新を提案する（古い記述の放置は禁止） |

### 書く場所の判断

| 内容 | 行き先 |
|---|---|
| 全タスク共通の核（プロジェクト要点・絶対要件・最重要原則） | このファイル CLAUDE.md |
| 特定パス／拡張子限定のルール | `.claude/rules/<topic>.md`（`paths:` frontmatter で自動ロード） |
| 2 回以上やる調査・操作の手順 | `.claude/skills/<name>/SKILL.md` |
| 1 回限りの調査・思考メモ | どこにも書かない（必要なら `_diag/` のスクリプトに残す） |

### 提案の作法

- **勝手に書き換えない**。「これを `.claude/rules/ui.md` の "ラベル明確化ルール" 節に追記しますか？」のように、
  ファイル名・該当箇所・追記文案を具体的に示してユーザに確認する
- 既存ファイルに追記できるなら新規ファイルを作らない
- CLAUDE.md は 200 行以下を目標。膨らんだら `.claude/rules/` に切り出す
- rules ファイルを新規作成するときは必ず `paths:` frontmatter を付ける（自動ロードを効かせるため）
- skill を新規作成するときは `description:` を具体的に書く（呼び出し時の triggering 精度に直結）
