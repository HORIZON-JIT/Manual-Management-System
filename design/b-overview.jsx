// B案の方向性 — 概要パネル

const Overview = () => (
  <div style={{
    width:'100%', height:'100%', background:'#FAFAF6',
    padding:'28px 32px', overflow:'auto',
    fontFamily:'var(--font-sans)', color:'#0B1B2B',
  }}>
    <div style={{display:'flex', alignItems:'baseline', gap:12, marginBottom:8}}>
      <div style={{fontSize:11, fontWeight:800, letterSpacing:'.14em', color:'#0EA37D'}}>B · DEEP DIVE</div>
      <div style={{flex:1, height:1, background:'#CBD5E1'}}/>
    </div>
    <h1 style={{margin:'0 0 8px', fontSize:26, fontWeight:800, letterSpacing:'-.01em', fontFamily:'var(--font-display)'}}>モダン SaaS 方向 — クリッカブル プロトタイプ</h1>
    <p style={{margin:'0 0 22px', fontSize:13, color:'#475569', lineHeight:1.75, maxWidth:680}}>
      濃いネイビーサイドバー + 余白広めのカードグリッド + 検索ファーストの導線。
      Linear / Notion 系の "整っているけど親しみやすい SaaS" を業務アプリの信頼感に再翻訳。
      各画面のキー要素をクリックすると実際に遷移します。
    </p>

    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:22}}>
      {[
        ['ホーム',     '検索ヒーロー + 続きから + 部署で人気。役割切替（現場担当者 / 管理者）。'],
        ['一覧',       '画像カードグリッド + チップフィルタ + アクティブな絞り込み chip。'],
        ['検索結果',   'タイトル / 本文 / タグでマッチ箇所をハイライト。関連度 % 表示と該当無しの新規作成導線。'],
        ['詳細',       'ヒーロー + 進捗カード + タブ（手順 / フロー / 履歴 / 添付 / 関連）+ アコーディオン式ステップ。'],
        ['編集',       'ブロックエディタ風。ステップごとに / コマンドで注意・チェック・画像を挿入。'],
      ].map(([t, d])=>(
        <div key={t} style={{background:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'14px 16px'}}>
          <div style={{fontSize:14, fontWeight:800, marginBottom:4}}>{t}</div>
          <div style={{fontSize:12, color:'#475569', lineHeight:1.6}}>{d}</div>
        </div>
      ))}
      <div style={{background:'#050D17', color:'#fff', border:'1px solid #050D17', borderRadius:12, padding:'14px 16px'}}>
        <div style={{fontSize:11, fontWeight:800, letterSpacing:'.1em', opacity:.7, marginBottom:6}}>USAGE</div>
        <div style={{fontSize:12.5, lineHeight:1.7, opacity:.9}}>
          下の各アートボードはクリック可能です。<br/>
          ホームの検索 →「VPN」検索結果 → 1件目をタップ → 詳細 → 編集、まで一本道で遷移します。
        </div>
      </div>
    </div>

    <div style={{display:'flex', gap:18, fontSize:12, color:'#475569', flexWrap:'wrap'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{width:18, height:18, background:'#050D17', borderRadius:4, display:'inline-block'}}/>
        <span><b>ink-900 (#050D17)</b> サイドバー / 強テキスト</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{width:18, height:18, background:'#0EA37D', borderRadius:4, display:'inline-block'}}/>
        <span><b>accent (#0EA37D)</b> アクション</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{width:18, height:18, background:'#FAFAF6', border:'1px solid #E2E8F0', borderRadius:4, display:'inline-block'}}/>
        <span><b>bg (#FAFAF6)</b> 主背景</span>
      </div>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <span style={{fontFamily:'var(--font-display)', fontWeight:800, fontSize:16}}>Plus Jakarta</span>
        <span>+ <span style={{fontFamily:'var(--font-sans)', fontWeight:700, fontSize:14}}>Noto Sans JP</span></span>
      </div>
    </div>
  </div>
);

window.BOverview = Overview;
