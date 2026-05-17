# Handoff: 手順書管理システム UI/UX 全面リデザイン

対象リポジトリ: [HORIZON-JIT/Manual-Management-System](https://github.com/HORIZON-JIT/Manual-Management-System)
スタック: Next.js 16 / React 19 / TypeScript / Tailwind CSS v4

---

## Overview

既存の手順書管理アプリ UI を、業務アプリの信頼感を残しつつモダンな SaaS トーン（Linear / Notion 系）に刷新します。

主な変更点:

1. **検索ファーストの導線**: ホーム / グローバルヘッダー両方にプロミネントな検索バー
2. **「探す」画面の新設**: 完成済み手順書を一覧・絞り込み・検索結果としてブラウズできる
3. **濃ネイビーサイドナビ**: `#050D17` ベース。カテゴリのドットインジケータ + ユーザー情報
4. **カテゴリ折衷案**: 公式ホワイトリスト + alias マップ + 未承認カテゴリの可視化 + 管理者承認キュー
5. **詳細・編集の刷新**: タブ + アコーディオン + 進捗 / ブロックエディタ風 + ステップ並び替え
6. **モーダル統一**: 共通シェル化（角丸 14px / シャドウ大 / ディム 0.55）
7. **状態別レイアウト**: 空 / 読み込み / エラー / 権限なし / オフライン
8. **モバイル最適化**: 下部タブ + 大きめタップ領域 + カード型 UI

---

## About the Design Files

このフォルダ内の HTML / JSX ファイルは **デザインリファレンス** です。本番コードとして直接コピーするものではなく、**目指す見た目・挙動の仕様書**として扱ってください。

実装タスクは、これらの HTML 設計を **既存の Next.js 16 + React 19 + Tailwind CSS v4 環境に再構築**することです。既存の `src/components`, `src/lib`, `src/types/instruction.ts` の構造とパターン（client component / server component の使い分け、`'use client'` 指定、`getStepImages()` 等の既存ユーティリティ）を踏襲して書き直してください。

`design/index.html` をブラウザで開くと、全画面をキャンバス上で確認できます。クリックで動線も確認可能です。

---

## Fidelity

**High-fidelity (hifi)** — ピクセル単位で色・タイポ・余白・コンポーネント形状を決めてあります。値はすべて下記「Design Tokens」セクションに記載。

ただし以下は **未確定** で実装時に判断が必要:

- アイコンセット: デザインでは SVG をインライン定義しているが、本番では `lucide-react` 等のライブラリ採用を推奨
- フォント: Google Fonts (Noto Sans JP + Plus Jakarta Sans) を想定。既存の Geist を残すなら `--font-display` のみ差し替える
- 角丸の最終値: デザインでは 14px と 10-12px を混在使用。Tailwind の `rounded-xl` (12px) / `rounded-2xl` (16px) に寄せても問題なし
- アニメーション: 詳細未設計。`transition-colors duration-150` 程度の素直な指定で十分

---

## Design Tokens

### Colors

```ts
// すべて Tailwind v4 の @theme で定義することを推奨
// app/globals.css に追加:

@theme {
  /* Surfaces */
  --color-bg:      #FAFAF6;   /* メイン背景 */
  --color-surface: #FFFFFF;   /* カード・モーダル */

  /* Ink (text & sidebar) */
  --color-ink-900: #050D17;   /* サイドナビ・最濃テキスト */
  --color-ink-800: #0A1726;
  --color-ink-700: #14253A;
  --color-ink-600: #2C4258;
  --color-ink-500: #64748B;   /* secondary text */
  --color-ink-400: #94A3B8;   /* placeholder */
  --color-ink-300: #CBD5E1;
  --color-ink-200: #E2E8F0;   /* borders */
  --color-ink-100: #EEF1F4;
  --color-ink-50:  #F4F6F8;   /* hover bg */

  /* Accent (primary action) */
  --color-accent:      #0EA37D;
  --color-accent-soft: #E0F4EE;
  --color-accent-ink:  #086150;

  /* Semantic */
  --color-warn:      #C2410C;
  --color-warn-soft: #FEEFE5;
  --color-ok:        #047857;
  --color-ok-soft:   #E2F3EB;
  --color-info:      #0369A1;
  --color-info-soft: #E6F2FA;

  /* Pending category (黄色マーク) */
  --color-pending-bg:     #FEF9C3;
  --color-pending-text:   #92400E;
  --color-pending-border: #EAB308;
}
```

### Category color dots (sidebar)

| Category | Color |
|---|---|
| 事務作業 | `#7DD3FC` |
| 情報システム | `#A78BFA` |
| 現場作業 | `#FB923C` |

### Typography

```css
--font-sans:    'Noto Sans JP', system-ui, sans-serif;
--font-display: 'Plus Jakarta Sans', 'Noto Sans JP', sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, Menlo, monospace;
```

| Use | Family | Weight | Size |
|---|---|---|---|
| ページ見出し (h1) | display | 700 | 24–32px / -0.01em letter-spacing |
| セクション見出し (h2) | sans | 700 | 18px |
| 本文 | sans | 400 | 14px / 1.75 line-height |
| ボタン | sans | 600 | 13px |
| ラベル (caps) | sans | 700 | 11px / 0.08em letter-spacing / uppercase |
| メタ (muted) | sans | 400 | 11–12px / ink-500 |
| バージョン・ID・コード | mono | 600 | 11–12px |

### Spacing

8px base. 推奨値: 4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 24 / 28 / 32 / 40 / 48px。Tailwind の標準スケール (`gap-2`, `p-4`, ...) で実装可能。

### Radius

| Use | Value |
|---|---|
| chip / pill | 999px |
| ボタン | 8px (`rounded-lg`) |
| カード | 12px (`rounded-xl`) |
| モーダル / ヒーロー | 14px (`rounded-[14px]`) |
| 大カード | 18px (`rounded-2xl`) |

### Shadows

```css
--shadow-1: 0 1px 2px rgba(11,27,43,.04), 0 1px 1px rgba(11,27,43,.03);
--shadow-2: 0 6px 24px -8px rgba(11,27,43,.10), 0 2px 4px rgba(11,27,43,.04);
--shadow-modal: 0 24px 60px rgba(11,27,43,.30);
```

---

## Screens / Views

### 1. Shell (全画面共通)

**Sidebar** — `width: 228px` / `bg: ink-900` / 固定 / 縦スクロール対応

- ロゴ + プロダクト名 (`手順書管理` / `HORIZON-JIT` mono small)
- メニュー: ホーム / 手順書を探す / ピン留め / 下書き / 閲覧履歴
- カテゴリラベル + 色ドット付き一覧（公式カテゴリの動的件数）
- **未承認カテゴリバッジ**（あるときだけ表示、黄色背景、クリックで `/admin/categories` へ）
- 下部: ユーザーアバター + 名前 + 所属 + ベル

**Header** (`/home` 以外で表示) — `height: 60px` / `bg: white` / `border-b ink-200`

- パンくず (ホーム > 一覧 > 手順書名)
- 検索バー (max-width 560px、`⌘K` ヒント付き)
- 「作成」プライマリボタン

### 2. Home (`/`)

- 「現場担当者 / 管理者」セグメントトグル
- 挨拶 + 日付 + 大きな検索バー（フォーカスでハイライト）
- よく検索されるキーワード chip
- **続きから** — 進捗バー付き 3 カード
- **あなたの部署でよく見られる** — 4 列カードグリッド

### 3. List (`/manuals`)

- カテゴリ chip フィルタ (横スクロール)
- アクティブな絞り込み chip + クリア
- 表示切替: リスト / グリッド (グリッドが標準)
- カード: 表紙画像 + カテゴリ chip + バージョン + タイトル + メタ (作成者・部署・更新日・閲覧数)

### 4. Search Results (`/search?q=...`)

- 結果カードに **マッチ箇所のハイライト** (`<mark>` で `#FEF08A` バックグラウンド)
- マッチ箇所 facet (タイトル / 本文 / タグ、件数付き)
- 関連度 %
- 該当なしの場合 → 「このキーワードで新規作成」CTA

### 5. Detail (`/m/<id>`)

- ヒーロー: カテゴリ chip + タグ + タイトル (28px display) + 説明 + メタ
- 右側: 進捗カード（X / N + プログレスバー + ピン・共有・印刷ボタン + 編集 CTA）
- タブ: 手順 / フローチャート / 更新履歴 / 添付ファイル / 関連手順
- ステップ: **アコーディオン式**、完了したステップはチェックアイコン
- 注意ボックス: `warn-soft` 背景 + 左 3px ボーダー
- チェックリスト: ステップ内チェックボックス

### 6. Edit (`/m/<id>/edit`)

- セカンダリツールバー: ID + 自動保存ステータス + 版数遷移 (`v3.1 → v3.2 草案`) + プレビュー / 公開
- 左サイド: ステップ一覧 (ドラッグ並び替え) + プロパティ
- メインエリア: ブロックエディタ風 (フォーカスしたステップに `accent-soft` 背景 + `accent` ボーダー + シャドウ)
- カテゴリ Combobox: 公式から選ぶ＋自由入力可
- `/` でブロック追加メニュー (見出し / 注意 / チェック / 画像 / ファイル / 関連手順)

### 7. Step Editor Detail

- 画像注釈ツール (矢印・四角・テキスト・削除)
- 画像上に位置指定された注釈オーバーレイ (番号付きラベル + 枠)
- **条件分岐**: 状態 chip → 分岐先 select (次のステップ / 別ステップへジャンプ / 完了)
- 関連リンク: 手順書 (ID 付き) / 外部 URL

### 8. Admin: Category Approval Queue (`/admin/categories`)

- 未承認カテゴリの値ごとにカード化（黄色破線ボーダー）
- 該当する手順書一覧をその場で確認
- アクション: 「このまま公式化」「既存に統合」「他」
- 右ペイン: 公式カテゴリリスト + alias マッピング一覧 + 追加ボタン

### 9. Drafts (`/instructions/drafts`)

- 既存実装をリデザイン: 2 列カードグリッド
- 各カードに進捗バー + 編集再開 / 複製 / 削除

### 10. New / Blank (`/instructions/new`)

- 空状態 + テンプレートグリッド (6 タイル)
- 既存から複製 / Drive から JSON 読込

### 11. Sign In (`/signin`)

- センター配置の認証カード
- Google サインインボタン
- データ取扱方針の表記

### 12. Modals (共通シェル)

```
+----------------------------------------+
| Title                          [×]     |
| Subtitle (optional)                    |
+----------------------------------------+
| Body (scroll)                          |
|                                        |
+----------------------------------------+
| [ghost btn]              [primary btn] |
+----------------------------------------+
```

- Backdrop: `rgba(11,27,43,0.55)` + `backdrop-blur(2px)`
- Container: `bg-white` / `border ink-200` / `rounded-[14px]` / `shadow-modal`
- Header: padding `16px 22px` / border-bottom
- Body: padding `18px 22px` / overflow-y auto
- Footer: padding `14px 22px` / border-top / `justify-end gap-10px`

実装済みモーダル:
- Help / ヘルプガイド (タブ付き)
- Drive Folder Picker / フォルダ階層 + 選択状態
- Drive JSON Picker / 検索 + ファイルリスト
- Share Link / 公開範囲 + URL + 期限・パスワード
- Version History / 左サイドリスト + 右側差分ビュー (赤緑 inline diff)
- View History / 日時 + 手順書リスト
- Flowchart / Mermaid 風の自動生成図

### 13. States (空 / 検索ゼロ / 読み込み / エラー / 権限なし / オフライン)

`design/index.html` の States セクション参照。スケルトンアニメは `@keyframes pulse` の標準実装。

---

## Category Registry (`lib/categoryRegistry.ts`)

**最重要**: Drive 上の JSON の `category` 文字列を正規化する中央ロジック。**最初の PR でこれだけ独立して切り出すことを推奨**。

```ts
// src/lib/categoryRegistry.ts

export type OfficialCategoryId = string;

export interface OfficialCategory {
  id: OfficialCategoryId;
  label: string;
  color: string;      // dot indicator
  description?: string;
}

export const OFFICIAL_CATEGORIES: OfficialCategory[] = [
  { id: '事務作業',     label: '事務作業',     color: '#7DD3FC', description: '経費・受発注・社内事務' },
  { id: '情報システム', label: '情報システム', color: '#A78BFA', description: 'IT サポート / インフラ' },
  { id: '現場作業',     label: '現場作業',     color: '#FB923C', description: '設備・機材・安全' },
];

// 旧 ID や日本語ゆれを公式 ID にマップ
export const CATEGORY_ALIASES: Record<string, OfficialCategoryId> = {
  'pc_work':    '事務作業',
  'packing':    '現場作業',
  'PC事務作業': '事務作業',
  '梱包作業':   '現場作業',
};

export function resolveCategory(raw: string | undefined | null): OfficialCategoryId | null {
  if (!raw) return null;
  if (OFFICIAL_CATEGORIES.find(c => c.id === raw)) return raw;
  if (CATEGORY_ALIASES[raw]) return CATEGORY_ALIASES[raw];
  return null;
}

export interface CategoryDisplay {
  label: string;
  official: boolean;
  color: string;
}

export function getCategoryDisplay(raw: string | undefined | null): CategoryDisplay {
  const resolved = resolveCategory(raw);
  if (resolved) {
    const cat = OFFICIAL_CATEGORIES.find(c => c.id === resolved)!;
    return { label: resolved, official: true, color: cat.color };
  }
  return { label: raw || '(未分類)', official: false, color: '#EAB308' };
}

export function getPendingCategories(items: { category?: string }[]): { id: string; count: number }[] {
  const map = new Map<string, number>();
  for (const it of items) {
    if (!resolveCategory(it.category)) {
      const key = it.category || '(未分類)';
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return [...map.entries()].map(([id, count]) => ({ id, count }));
}

export function getOfficialCounts(items: { category?: string }[]) {
  return OFFICIAL_CATEGORIES.map(c => ({
    ...c,
    count: items.filter(it => resolveCategory(it.category) === c.id).length,
  }));
}
```

既存の `types/instruction.ts` の `CATEGORY_LABELS` と `getCategoryLabel()` はこのレジストリと統合してください（後方互換のため `getCategoryLabel()` は残し、内部で `getCategoryDisplay().label` を呼ぶ）。

---

## Interactions & Behavior

### グローバル

- `⌘ K` (Mac) / `Ctrl K` (Win) でグローバル検索フォーカス
- サイドバーは PC のみ。スマホは下部タブナビゲーション + 上部ドロワー
- パンくずから前のページに戻れる
- すべてのクリック可能要素に focus-visible リング (`outline: 2px solid var(--color-accent); outline-offset: 2px;`)

### Home → Search → Detail → Edit (主要動線)

1. ホームの検索バーで Enter → `/search?q=...`
2. 検索結果カードクリック → `/m/<id>`
3. 詳細の「編集」ボタン → `/m/<id>/edit`
4. 編集の「公開」 → `/m/<id>` (詳細に戻る)

### Detail のステップアコーディオン

- 初期状態: 進行中のステップが展開、完了済みは折りたたみ
- ステップヘッダークリックで toggle
- 完了アイコン: 緑チェック / 進行中: ネイビー番号 / 未着手: グレー番号

### Edit のブロックエディタ

- ステップにフォーカスすると accent ボーダー + シャドウで強調
- `/` キーで挿入メニュー (見出し / 注意 / チェック / 画像 / ファイル / 関連手順)
- ドラッグハンドルで並び替え (`dnd-kit` 推奨)
- 自動保存: 1.5 秒デバウンス → localStorage + Drive 同期

### カテゴリ Combobox

- クリックでドロップダウン展開
- 検索ボックスで filter
- 公式カテゴリリスト + 自由入力の case で「未承認として保存」警告表示
- 既存カテゴリのときは accent chip / 新規 (未承認) のときは yellow dashed chip

### Modal

- ESC で閉じる
- バックドロップクリックで閉じる
- フォーカストラップ (`focus-trap-react` 推奨)
- 開いている間 `body { overflow: hidden }`

---

## State Management

### 既存の維持

`src/lib/storage.ts` (`getAllInstructions`, `getInstruction`, `importInstruction`, `deleteInstruction`) と `src/lib/tempStorage.ts` (IndexedDB ベース) はそのまま使用。挙動を変更しないこと。

### 新規追加

```ts
// src/lib/searchIndex.ts (新規)
// 全文検索インデックス。タイトル/本文/タグ/キーワードを横断検索。
// 軽量実装案: 線形スキャン + 正規化スコアリング (10MB 未満なら十分高速)
// 大規模化したら lunr.js or flexsearch を導入
```

```ts
// src/hooks/useGlobalSearchHotkey.ts (新規)
// ⌘K / Ctrl K でグローバル検索を開く
```

```ts
// src/lib/categoryRegistry.ts (新規・上記)
```

### ローカル状態 (各ページ)

- ホーム: `useState` で `query` のみ
- 一覧: `useState({ category, period, dept, sortBy, view })`
- 検索結果: `useSearchParams()` から `q` を読み、結果を `useMemo` でフィルタ
- 詳細: `useState({ openStepId, checkStates })` (`checkStates` はステップ毎の Record)
- 編集: `useState({ activeStepId, isDirty, saveStatus })` + 自動保存 effect

サーバー状態 (Drive 同期) は既存実装のまま。

---

## Mobile / Responsive

### ブレークポイント

- `< 768px`: モバイル — 下部タブ + 縦カードリスト
- `>= 768px`: PC — サイドナビ + 横グリッド

### モバイル共通

- 下部タブ: ホーム / 探す / **作成 (FAB 風中央)** / ピン / 設定
- 上部はパンくずなし。戻る `<` ボタンのみ
- カードは横スクロール (続きから) or 縦並び (一覧)
- モーダルは画面下から sheet 風スライドアップ (デザインキャンバスでは PC のみ実装、モバイル版は同じ共通シェル + 全画面表示で OK)

### タップ領域

- 最低 44×44px
- ボタン高さ標準: 34px (sm) / 40px (md) / 46–50px (mobile primary)

---

## Files

このフォルダ内:

```
design_handoff_mms_redesign/
├── README.md                    ← この文書
└── design/
    ├── index.html               ← デザインキャンバス エントリポイント
    ├── styles.css               ← デザイントークン (CSS variables)
    ├── shared.jsx               ← サンプルデータ + アイコン + フレーム
    ├── b-shell.jsx              ← サイドバー + ヘッダー
    ├── b-pc.jsx                 ← PC 主要画面 (ホーム/一覧/検索/詳細/編集/管理)
    ├── b-mobile.jsx             ← モバイル主要画面
    ├── b-prototype.jsx          ← クリック遷移ルーター
    ├── b-extras.jsx             ← 追加ページ + モーダル雛形 + ステップ詳細 + 状態
    ├── b-overview.jsx           ← 方向性パネル
    ├── design-canvas.jsx        ← キャンバスホスト (パン/ズーム/フォーカス)
    ├── tweaks-panel.jsx         ← Tweaks UI フレームワーク
    └── tweaks.jsx               ← カラー/サイズ/ダーク切替
```

ローカルで `design/index.html` を開いてキャンバスを確認してください。**`open design/index.html` ではなく、`python3 -m http.server` などで配信してから開いてください**（Babel 変換のため）。

---

## Recommended PR Plan

一発で全画面差し替えはリスクが大きいので、7 本に分割推奨:

| # | タイトル | 主な変更 |
|---|---|---|
| 1 | `chore: design tokens` | `app/globals.css` に `@theme` 追加 + 色/タイポ token 定義 |
| 2 | `feat: category registry` | `lib/categoryRegistry.ts` + 既存 `getCategoryLabel` を移行 + 単体テスト |
| 3 | `feat: app shell` | `components/Sidebar.tsx` + `Header.tsx` 刷新 + `layout.tsx` 更新 |
| 4 | `feat: home + list + search` | ホーム再設計 + 一覧画面新設 + 検索結果ページ + `lib/searchIndex.ts` |
| 5 | `feat: detail redesign` | `view/page.tsx` 刷新 (タブ + アコーディオン + 進捗) |
| 6 | `feat: edit redesign` | `edit/page.tsx` + `InstructionForm.tsx` + `StepEditor.tsx` 刷新 (Combobox + ブロックエディタ) |
| 7 | `feat: admin + modals` | カテゴリ承認キュー + 全モーダルを共通シェル化 + 状態別レイアウト |

各 PR にデザインキャンバスの該当アートボードのスクリーンショットを添付するとレビューがスムーズです。

---

## Assets

このリデザインでは新規画像アセットは不要です:

- ロゴ: `M` の文字を `bg-ink-900 text-white rounded-lg` で表示
- カテゴリアイコン: 色ドットのみ
- アバター: イニシャル文字 + 単色背景
- 表紙画像 (一覧カード上部): プレースホルダー (今後ユーザーがアップロードする想定 — `<image-slot>` 相当のコンポーネントを後日追加)

アイコンライブラリは `lucide-react` を導入してください (依存追加: `npm i lucide-react`)。

---

## Out of Scope (今回扱わない)

- 既存の Drive 連携・認証ロジック (`lib/googleDrive.ts`, `lib/googleAuth.ts`)
- 既存の Word/PDF/Excel エクスポート (`lib/exportPdf.ts` 等)
- Mermaid フローチャート生成ロジック (`lib/buildFlowchart.ts`) — デザインでモーダル UI のみ刷新、生成ロジックは流用
- 共有リンクの圧縮 (`lib/shareLink.ts`, `lz-string`)

これらは触らず、UI 層のみ刷新してください。

---

## Questions for Developer

実装に着手する前に確認したい点:

1. **アイコンライブラリ**: `lucide-react` で OK か？ (推奨)
2. **dnd ライブラリ**: ステップ並び替えに `@dnd-kit/core` を導入して良いか？
3. **モーダル**: 既存の Headless UI / Radix UI 等を導入するか、独自実装か？
4. **フォント**: Google Fonts (Noto Sans JP + Plus Jakarta Sans) を採用するか、既存の Geist を継続するか？
5. **検索インデックス**: 100 件程度なら線形スキャンで十分。1000 件超になる可能性があれば `flexsearch` を最初から導入したい

最後に: わからない点があれば**実装する前に**質問してください。デザインを誤って読んで作り直すよりも、確認を挟むほうが早いです。
