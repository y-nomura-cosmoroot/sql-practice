---
paths:
  - ".github/workflows/**"
---

# GitHub Actions / Claude 自動 PR レビュー（claude-pr-review.yml）の注意点

`anthropics/claude-code-action` を使った自動 PR レビューで実際にハマった落とし穴。
症状はどれも「ジョブは success（緑）なのにレビューコメントが付かない」で共通なので、
**原因の切り分けが必須**。

## 1. トリガー：push では動かない

トリガーは `pull_request`(opened/synchronize) と `workflow_dispatch` のみ。

- **main へ直接 push してもレビューは走らない**（`push` イベントは購読していない）。
- 既存 PR を再レビューさせるには、その **PR の head ブランチに新しいコミットを push**（synchronize）
  するか、PR を再オープンする。
- `workflow_dispatch`（手動実行）は PR 文脈が無いため、PR コメント目的の確認には不向き。

## 2. pull_request は head ブランチのワークフローで動く

`pull_request` イベントで実行される YAML は、**PR の head ブランチ側の版**（base=main ではない）。

- **main のワークフローを更新しただけでは、既存 PR には反映されない。**
- 反映するには `git merge origin/main` で **PR ブランチに取り込んでから push**
  （この push が synchronize トリガーも兼ねる）。

## 3. `track_progress: true` はデフォルトブランチと同一内容が必須

アクションがコメントを投稿する `track_progress: true` を有効にすると、セキュリティ検証が入り、
**PR ブランチのワークフローファイルがデフォルトブランチ(main)の版とバイト単位で一致**して
いないとアクションが自分でスキップする。

- 症状: 実行が極端に短く（十数秒）、Claude が起動せず、ログに
  `Skipping action due to workflow validation: ... must ... have identical content
  to the version on the repository's default branch`。
- つまり **ワークフロー自体を変更する PR では、その変更が原因で動かない**（卵が先か問題）。
- 対処: ワークフロー変更は**先に main に載せる**。動作確認は
  **ワークフローを触らない別の小さな PR**で行う（head=main と一致 → 検証パス）。

## 4. コメント投稿は track_progress に任せる（gh pr comment の allowlist 落とし穴）

エージェントに `gh pr comment` させる方式（`--allowed-tools "Bash(gh pr comment:*)"`）は、
Claude が本文を `gh pr comment N --body "$(cat <<'EOF' … EOF)"` の形で組むと、内部の
**コマンド置換 `$(cat …)` が許可パターンに一致せず拒否**される。

- 症状: 実行は success だが `permission_denials_count: 1`、**コメントは無言で付かない**。
- 対処: 投稿はエージェントにさせず **`track_progress: true` でアクションに任せ**、プロンプトは
  「結果はこの回答にまとめて出力（投稿はアクションが行う）」とする。読み取り用に
  `Read,Grep,Glob` と `Bash(gh pr diff:*),Bash(gh pr view:*)` を許可すれば十分。

## 5. 診断のしかた（success なのにコメントが無い時）

```bash
gh run list --workflow=claude-pr-review.yml -L 3
gh run view --job=<jobID> --log | grep -A8 '"type": "result"'   # 末尾の result JSON
gh pr view <PR番号> --comments                                  # claude[bot] の投稿有無
```

result JSON の読み方:

| フィールド | 意味 |
|---|---|
| `is_error: false` / `subtype: "success"` | Claude 自体は正常終了（エラーではない） |
| `permission_denials_count >= 1` | 許可外ツール（多くは投稿コマンド）が拒否された |
| 実行が十数秒で終了＋"workflow validation" | §3 の検証スキップ |

## 6. 認証とその他

- 認証は `CLAUDE_CODE_OAUTH_TOKEN`（`claude setup-token` で生成・Pro/Max・**期限あり**）か
  `ANTHROPIC_API_KEY` のどちらか一方。**Secrets 名は YAML の参照名と完全一致**が必須。
- `Node.js 20 is deprecated` 警告は `actions/checkout@v4` → `@v5` に上げれば消える（任意・互換）。
