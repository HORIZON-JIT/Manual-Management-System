// B案 — 追加画面群: ページ / モーダル / 状態
// 既存リポジトリの未設計箇所を補完するための仕様アートボード。

const { sampleInstructions, sampleSteps, BrowserFrame, PhoneFrame, I,
  CategoryChip, getCategoryDisplay, officialCategories } = window.shared;

// ============================================================================
// Modal shell — 親画面の上にディム + モーダルを乗せた状態を 1 つの絵にする
// ============================================================================
const ModalShell = ({ title, sub, width = 520, children, footer }) => (
  <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(11,27,43,.55)', backdropFilter:'blur(2px)', padding:24}}>
    <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:14, width, maxWidth:'100%', maxHeight:'90%', display:'flex', flexDirection:'column', boxShadow:'0 24px 60px rgba(11,27,43,.30)', overflow:'hidden'}}>
      <div style={{display:'flex', alignItems:'center', gap:10, padding:'16px 22px', borderBottom:'1px solid var(--ink-200)'}}>
        <div style={{flex:1}}>
          <div style={{fontSize:15, fontWeight:700}}>{title}</div>
          {sub && <div className="tiny muted" style={{marginTop:2}}>{sub}</div>}
        </div>
        <button style={{background:'transparent', border:0, cursor:'pointer', color:'var(--ink-500)', padding:6}}>×</button>
      </div>
      <div style={{flex:1, overflow:'auto'}}>{children}</div>
      {footer && <div style={{padding:'14px 22px', borderTop:'1px solid var(--ink-200)', display:'flex', alignItems:'center', gap:10, justifyContent:'flex-end'}}>{footer}</div>}
    </div>
  </div>
);

// 親画面の薄いプレースホルダー（モーダル背景用）
const ParentShellBG = () => (
  <div style={{height:'100%', display:'flex', filter:'saturate(.85) brightness(.95)'}}>
    <div style={{width:228, background:'var(--ink-900)'}}/>
    <div style={{flex:1, background:'#FAFAF6'}}/>
  </div>
);

// ============================================================================
// PAGES
// ============================================================================

// 下書き一覧 -------------------------------------------------------------
const DraftsPC = () => {
  const drafts = sampleInstructions.slice(0,4).map(it => ({
    ...it, status: 'draft', progress: [3, 7, 1, 0][sampleInstructions.indexOf(it)] || 2,
  }));
  return (
    <BrowserFrame url="mms.horizon-jit.example/drafts" className="pat-b">
      <div style={{display:'flex', height:'100%', background:'#FAFAF6'}}>
        <aside style={{width:228, background:'var(--ink-900)'}}/>
        <main style={{flex:1, overflow:'auto'}}>
          <div style={{padding:'18px 32px 14px', borderBottom:'1px solid var(--ink-200)', background:'#fff', display:'flex', alignItems:'center', gap:12}}>
            <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--ink-500)'}}>
              <I.home size={13}/><I.chevR size={11}/><span style={{color:'var(--ink-900)', fontWeight:600}}>下書き</span>
            </div>
            <div style={{flex:1}}/>
            <button className="btn ghost">JSON から読込</button>
            <button className="btn primary"><I.plus size={14}/> 新規作成</button>
          </div>
          <div style={{padding:'22px 32px'}}>
            <div style={{display:'flex', alignItems:'baseline', gap:10, marginBottom:18}}>
              <h1 style={{margin:0, fontSize:22, fontWeight:700}}>下書き</h1>
              <span className="muted" style={{fontSize:13}}>{drafts.length} 件 · 自動保存されています</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:14}}>
              {drafts.map(it => (
                <div key={it.id} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'16px 18px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
                    <CategoryChip raw={it.category}/>
                    <span className="chip" style={{background:'var(--warn-soft)', color:'var(--warn)'}}>下書き</span>
                    <span className="tiny muted" style={{marginLeft:'auto', fontFamily:'var(--font-mono)'}}>{it.version}</span>
                  </div>
                  <div style={{fontWeight:700, fontSize:15, marginBottom:8, lineHeight:1.4}}>{it.title || '無題の手順書'}</div>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--ink-500)', marginBottom:8}}>
                    <span>ステップ {it.progress} / {it.steps}</span>
                    <span>最終編集: {it.updated} 14:32</span>
                  </div>
                  <div style={{height:5, background:'var(--ink-100)', borderRadius:99, overflow:'hidden', marginBottom:12}}>
                    <div style={{height:'100%', width:`${(it.progress/it.steps)*100}%`, background:'var(--accent)'}}/>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    <button className="btn primary" style={{flex:1, height:32, fontSize:12}}>編集を再開</button>
                    <button className="btn ghost" style={{height:32, fontSize:12}}>複製</button>
                    <button className="btn ghost" style={{height:32, fontSize:12, padding:'0 10px', color:'var(--warn)'}}><I.trash size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </BrowserFrame>
  );
};

// 新規作成 空状態 -------------------------------------------------------------
const NewBlankPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/m/new" className="pat-b">
    <div style={{display:'flex', height:'100%', background:'#FAFAF6'}}>
      <aside style={{width:228, background:'var(--ink-900)'}}/>
      <main style={{flex:1, overflow:'auto', padding:'40px 32px'}}>
        <div style={{maxWidth:720, margin:'0 auto'}}>
          <div className="label" style={{marginBottom:8}}>新規手順書</div>
          <h1 style={{margin:'0 0 12px', fontSize:30, fontWeight:700, letterSpacing:'-.01em', fontFamily:'var(--font-display)', color:'var(--ink-400)'}}>無題の手順書</h1>
          <div className="muted" style={{fontSize:14, marginBottom:24}}>タイトル・カテゴリ・説明を入力してから、ステップを追加してください。テンプレートを選択するとすぐに作り始められます。</div>

          <div className="label" style={{marginBottom:10}}>テンプレートから始める</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:32}}>
            {[
              ['白紙から', '0 ステップ', 'シンプルな白紙'],
              ['Tier1 障害対応', '6 ステップ', '症状確認 → 切り分け'],
              ['月次オペレーション', '12 ステップ', 'チェックリスト + 報告'],
              ['設備点検', '5 ステップ', '安全 → 点検 → 報告'],
              ['オンボーディング', '9 ステップ', 'アカウント → 環境'],
              ['+ カスタム', '管理者のみ', ''],
            ].map(([t, n, d], i) => (
              <button key={t} style={{background:'#fff', border:'1px solid '+(i===0?'var(--accent)':'var(--ink-200)'), borderRadius:10, padding:'14px 14px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', boxShadow: i===0?'0 0 0 4px var(--accent-soft)':'none'}}>
                <div style={{fontWeight:700, fontSize:13, marginBottom:4}}>{t}</div>
                <div className="tiny muted" style={{marginBottom:4}}>{n}</div>
                <div className="tiny" style={{color:'var(--ink-600)'}}>{d}</div>
              </button>
            ))}
          </div>

          <div className="label" style={{marginBottom:10}}>または 既存から</div>
          <div style={{display:'flex', gap:10}}>
            <button className="btn ghost" style={{flex:1}}><I.folder size={14}/> Drive から JSON を読み込む</button>
            <button className="btn ghost" style={{flex:1}}><I.doc size={14}/> 既存手順書を複製</button>
          </div>
        </div>
      </main>
    </div>
  </BrowserFrame>
);

// サインイン -------------------------------------------------------------
const SignInPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/signin" className="pat-b">
    <div style={{height:'100%', background:'#FAFAF6', display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
      <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:18, padding:'40px 44px', maxWidth:440, width:'100%', boxShadow:'var(--shadow-2)'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:24}}>
          <div style={{width:40, height:40, borderRadius:9, background:'var(--ink-900)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontFamily:'var(--font-display)', fontSize:16}}>M</div>
          <div>
            <div style={{fontWeight:700, fontSize:15}}>手順書管理</div>
            <div className="tiny muted" style={{fontFamily:'var(--font-mono)'}}>HORIZON-JIT</div>
          </div>
        </div>
        <h1 style={{margin:'0 0 8px', fontSize:24, fontWeight:700, letterSpacing:'-.01em'}}>サインインしてください</h1>
        <div className="muted" style={{fontSize:13, marginBottom:24, lineHeight:1.7}}>手順書は Google Drive に保存されています。社内 Google アカウントで認証してください。</div>
        <button className="btn primary" style={{width:'100%', height:46, fontSize:14, gap:10}}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#fff" d="M17.6 9.2c0-.6 0-1.2-.2-1.7H9v3.3h4.8c-.2 1.1-.8 2-1.7 2.6v2.2h2.8c1.6-1.5 2.7-3.7 2.7-6.4z"/></svg>
          Google でサインイン
        </button>
        <div className="divider" style={{margin:'24px 0'}}/>
        <div className="tiny muted" style={{lineHeight:1.7}}>
          サインインすると、利用規約および社内データ取扱方針に同意したものとみなされます。Drive 内の手順書フォルダにのみアクセスします。
        </div>
      </div>
    </div>
  </BrowserFrame>
);

// ============================================================================
// MODALS
// ============================================================================

// ヘルプ
const HelpModalPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/" className="pat-b">
    <div style={{position:'relative', height:'100%'}}>
      <ParentShellBG/>
      <ModalShell title="使い方ガイド" sub="基本操作と便利機能のヒント" width={640} footer={<button className="btn primary">閉じる</button>}>
        <div style={{padding:'18px 22px'}}>
          <div style={{display:'flex', gap:0, borderBottom:'1px solid var(--ink-200)', marginBottom:18}}>
            {[['はじめに',true],['ショートカット'],['Drive 連携'],['よくある質問']].map(([l, a])=>(
              <div key={l} style={{padding:'10px 14px', borderBottom: a?'2px solid var(--accent)':'2px solid transparent', color: a?'var(--accent-ink)':'var(--ink-500)', fontSize:13, fontWeight:600, marginBottom:-1}}>{l}</div>
            ))}
          </div>
          <h3 style={{margin:'0 0 8px', fontSize:15, fontWeight:700}}>1. 手順書を探す</h3>
          <p style={{margin:'0 0 14px', fontSize:13, color:'var(--ink-700)', lineHeight:1.75}}>ホーム画面の検索バーから、タイトル・本文・タグで横断検索できます。<kbd style={{fontFamily:'var(--font-mono)', background:'var(--ink-100)', padding:'1px 6px', borderRadius:3, fontSize:11}}>⌘ K</kbd> でどの画面からも検索を開けます。</p>
          <h3 style={{margin:'14px 0 8px', fontSize:15, fontWeight:700}}>2. ステップを実行</h3>
          <p style={{margin:'0 0 14px', fontSize:13, color:'var(--ink-700)', lineHeight:1.75}}>詳細画面のステップを開くと、チェックボックスで進捗を記録できます。最後まで進めると自動的に完了マークが付きます。</p>
          <h3 style={{margin:'14px 0 8px', fontSize:15, fontWeight:700}}>3. 新規作成 / 編集</h3>
          <p style={{margin:'0 0 14px', fontSize:13, color:'var(--ink-700)', lineHeight:1.75}}>右上の「作成」から白紙またはテンプレートで開始。編集中は自動保存され、いつでも「公開」できます。</p>
          <div style={{background:'var(--ink-50)', border:'1px solid var(--ink-200)', borderRadius:10, padding:'12px 14px', marginTop:14, fontSize:12}}>
            <b>困ったら</b> · 情シス Slack <code style={{fontFamily:'var(--font-mono)'}}>#mms-support</code> までお気軽に
          </div>
        </div>
      </ModalShell>
    </div>
  </BrowserFrame>
);

// Drive フォルダ選択
const DriveFolderPickerPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/" className="pat-b">
    <div style={{position:'relative', height:'100%'}}>
      <ParentShellBG/>
      <ModalShell title="保存先 Drive フォルダ" sub="新規作成・更新時の保存先" width={560} footer={<>
        <button className="btn ghost">キャンセル</button>
        <button className="btn primary">この場所を選択</button>
      </>}>
        <div style={{padding:'10px 22px 18px'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, padding:'10px 0', borderBottom:'1px solid var(--ink-200)', color:'var(--ink-500)'}}>
            <I.folder size={14} style={{color:'#F4BE4F'}}/>
            <span>マイドライブ</span><I.chevR size={11}/>
            <span>社内文書</span><I.chevR size={11}/>
            <span style={{color:'var(--ink-900)', fontWeight:600}}>手順書</span>
          </div>
          <div style={{padding:'4px 0'}}>
            {[
              ['営業企画部', 38, false],
              ['情シス', 21, true],
              ['経理課', 14, false],
              ['総務', 27, false],
              ['共有テンプレート', 8, false],
            ].map(([name, n, sel]) => (
              <button key={name} style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'11px 10px', background: sel?'var(--accent-soft)':'transparent', border:0, borderRadius:7, cursor:'pointer', fontFamily:'inherit', textAlign:'left'}}>
                <I.folder size={18} style={{color:'#F4BE4F'}}/>
                <span style={{flex:1, fontSize:13, fontWeight:sel?700:500, color: sel?'var(--accent-ink)':'inherit'}}>{name}</span>
                <span className="tiny muted">{n} ファイル</span>
                {sel && <I.check size={14} style={{color:'var(--accent-ink)'}}/>}
                <I.chevR size={14} style={{color:'var(--ink-400)'}}/>
              </button>
            ))}
          </div>
          <button style={{display:'flex', alignItems:'center', gap:8, marginTop:10, padding:'10px 12px', background:'var(--ink-50)', border:'1px dashed var(--ink-300)', borderRadius:8, width:'100%', cursor:'pointer', fontFamily:'inherit', fontSize:12, color:'var(--ink-600)'}}>
            <I.plus size={13}/> ここに新しいフォルダを作成
          </button>
        </div>
      </ModalShell>
    </div>
  </BrowserFrame>
);

// Drive JSON ピッカー
const DriveJsonPickerPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/" className="pat-b">
    <div style={{position:'relative', height:'100%'}}>
      <ParentShellBG/>
      <ModalShell title="Drive から手順書を読み込む" sub="JSON ファイルを選択して開きます" width={600} footer={<>
        <button className="btn ghost">キャンセル</button>
        <button className="btn primary">この手順書を開く</button>
      </>}>
        <div style={{padding:'8px 22px 18px'}}>
          <div style={{display:'flex', alignItems:'center', gap:10, height:36, background:'var(--ink-50)', borderRadius:8, padding:'0 12px', marginBottom:14}}>
            <I.search/>
            <input placeholder="ファイル名で絞り込み" style={{flex:1, border:0, outline:0, background:'transparent', fontSize:13, fontFamily:'inherit'}} readOnly/>
          </div>
          <div style={{padding:'4px 0'}}>
            {sampleInstructions.slice(0,5).map((it, i) => (
              <button key={it.id} style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 8px', background: i===0?'var(--accent-soft)':'transparent', border:0, borderRadius:6, cursor:'pointer', fontFamily:'inherit', textAlign:'left'}}>
                <div style={{width:32, height:32, borderRadius:6, background:'var(--ink-100)', display:'flex', alignItems:'center', justifyContent:'center'}}><I.doc size={14}/></div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13, fontWeight:600}}>{it.title}.json</div>
                  <div className="tiny muted">{it.updated} · {it.author} · <span style={{fontFamily:'var(--font-mono)'}}>{it.version}</span></div>
                </div>
                {i===0 && <I.check size={14} style={{color:'var(--accent-ink)'}}/>}
              </button>
            ))}
          </div>
        </div>
      </ModalShell>
    </div>
  </BrowserFrame>
);

// 共有リンク
const ShareLinkModalPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/m/MN-2407-003" className="pat-b">
    <div style={{position:'relative', height:'100%'}}>
      <ParentShellBG/>
      <ModalShell title="共有リンクを発行" sub="社内 / 社外への配布リンクを作成" width={480} footer={<>
        <button className="btn ghost">閉じる</button>
        <button className="btn primary"><I.share size={13}/> リンクをコピー</button>
      </>}>
        <div style={{padding:'18px 22px'}}>
          <div className="label" style={{marginBottom:6}}>公開範囲</div>
          <div style={{display:'flex', gap:0, border:'1px solid var(--ink-200)', borderRadius:8, padding:3, marginBottom:18}}>
            {[['社内のみ',true],['リンクを知る全員']].map(([l, a])=>(
              <button key={l} style={{flex:1, padding:'7px 10px', borderRadius:5, border:0, background: a?'var(--ink-900)':'transparent', color: a?'#fff':'var(--ink-600)', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit'}}>{l}</button>
            ))}
          </div>

          <div className="label" style={{marginBottom:6}}>リンク URL</div>
          <div style={{display:'flex', alignItems:'center', gap:8, height:36, background:'var(--ink-50)', borderRadius:7, padding:'0 12px', marginBottom:18, fontFamily:'var(--font-mono)', fontSize:11.5, color:'var(--ink-700)'}}>
            <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>https://mms.horizon-jit.example/m/MN-2407-003?t=ksz3-9a2f</span>
            <I.attach size={13} style={{color:'var(--ink-500)', cursor:'pointer'}}/>
          </div>

          <label style={{display:'flex', alignItems:'center', gap:10, padding:'10px 0', fontSize:13, cursor:'pointer'}}>
            <input type="checkbox" defaultChecked style={{accentColor:'var(--accent)'}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>有効期限を設定</div>
              <div className="tiny muted">指定日以降はリンクから閲覧できなくなります</div>
            </div>
            <select style={{padding:'5px 8px', border:'1px solid var(--ink-200)', borderRadius:6, fontSize:12, fontFamily:'inherit', background:'#fff'}}>
              <option>7 日間</option><option>30 日間</option>
            </select>
          </label>
          <label style={{display:'flex', alignItems:'center', gap:10, padding:'10px 0', fontSize:13}}>
            <input type="checkbox" style={{accentColor:'var(--accent)'}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>パスワード保護</div>
              <div className="tiny muted">閲覧時にパスワード入力を要求</div>
            </div>
          </label>
        </div>
      </ModalShell>
    </div>
  </BrowserFrame>
);

// 版履歴
const VersionHistoryModalPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/m/MN-2407-003" className="pat-b">
    <div style={{position:'relative', height:'100%'}}>
      <ParentShellBG/>
      <ModalShell title="版履歴" sub="社内VPN接続トラブル対応" width={720} footer={<>
        <button className="btn ghost">閉じる</button>
        <button className="btn primary">この版に戻す</button>
      </>}>
        <div style={{padding:'14px 22px 22px', display:'grid', gridTemplateColumns:'240px 1fr', gap:18}}>
          <div>
            {[
              ['v3.1', '2026-05-09', '山田 涼', true],
              ['v3.0', '2026-04-12', '山田 涼'],
              ['v2.4', '2026-02-28', '田中 美咲'],
              ['v2.3', '2025-12-15', '山田 涼'],
              ['v2.0', '2025-10-01', '山田 涼'],
              ['v1.0', '2025-05-18', '山田 涼'],
            ].map(([v, d, who, sel]) => (
              <button key={v} style={{display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', background: sel?'var(--accent-soft)':'transparent', border:0, borderRadius:7, cursor:'pointer', fontFamily:'inherit', textAlign:'left', marginBottom:2}}>
                <span style={{fontFamily:'var(--font-mono)', fontWeight:700, fontSize:13, color: sel?'var(--accent-ink)':'var(--ink-700)', minWidth:36}}>{v}</span>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:12, fontWeight:600}}>{d}</div>
                  <div className="tiny muted">{who}</div>
                </div>
                {sel && <span className="chip ok" style={{fontSize:10, height:18}}>現行</span>}
              </button>
            ))}
          </div>
          <div style={{background:'var(--ink-50)', borderRadius:10, padding:16, fontSize:12}}>
            <div style={{fontWeight:700, marginBottom:8}}>v3.1 で変更された箇所</div>
            <div style={{lineHeight:1.8}}>
              <div><span style={{background:'#FCA5A5', color:'#7F1D1D', padding:'0 4px', textDecoration:'line-through'}}>VPN クライアント (旧)</span> → <span style={{background:'#86EFAC', color:'#14532D', padding:'0 4px'}}>VPN クライアント v2.4</span></div>
              <div style={{marginTop:6}}><b>+ 追加:</b> ステップ 5「証明書の手動更新」</div>
              <div style={{marginTop:6}}><b>- 削除:</b> 旧手順「IE 互換モードで開く」（Edge 移行に伴い）</div>
              <div style={{marginTop:6}} className="muted">3 ステップ変更 · 1 ステップ追加 · 1 ステップ削除</div>
            </div>
          </div>
        </div>
      </ModalShell>
    </div>
  </BrowserFrame>
);

// 閲覧履歴
const ViewHistoryModalPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/" className="pat-b">
    <div style={{position:'relative', height:'100%'}}>
      <ParentShellBG/>
      <ModalShell title="閲覧履歴" sub="最近開いた手順書" width={560} footer={<button className="btn primary">閉じる</button>}>
        <div style={{padding:'8px 22px 18px'}}>
          {sampleInstructions.slice(0,7).map((it, i) => (
            <button key={it.id} style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 8px', background:'transparent', border:0, borderRadius:6, cursor:'pointer', fontFamily:'inherit', textAlign:'left', borderBottom:'1px solid var(--ink-100)'}}>
              <div style={{width:38, textAlign:'center', fontSize:10, color:'var(--ink-500)'}}>
                <div style={{fontWeight:700}}>{['今日','今日','昨日','5/14','5/12','5/9','5/7'][i]}</div>
                <div>{['14:32','11:08','17:45','09:12','15:30','10:00','16:24'][i]}</div>
              </div>
              <CategoryChip raw={it.category} size="sm"/>
              <div style={{flex:1, fontSize:13, fontWeight:600}}>{it.title}</div>
              <span className="tiny muted" style={{fontFamily:'var(--font-mono)'}}>{it.version}</span>
            </button>
          ))}
        </div>
      </ModalShell>
    </div>
  </BrowserFrame>
);

// フローチャート (Mermaid 風)
const FlowchartModalPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/m/MN-2407-003" className="pat-b">
    <div style={{position:'relative', height:'100%'}}>
      <ParentShellBG/>
      <ModalShell title="フローチャート" sub="社内VPN接続トラブル対応 · 自動生成" width={780} footer={<>
        <button className="btn ghost"><I.download size={13}/> PNG</button>
        <button className="btn ghost"><I.download size={13}/> SVG</button>
        <button className="btn primary">閉じる</button>
      </>}>
        <div style={{padding:'14px 22px 22px'}}>
          <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:10, padding:'24px 18px', display:'flex', flexDirection:'column', alignItems:'center', gap:14}}>
            {/* Mermaid-style nodes */}
            <FlowNode kind="start">開始</FlowNode>
            <FlowArrow/>
            <FlowNode>① ネットワーク到達性を確認</FlowNode>
            <FlowArrow/>
            <FlowNode kind="diamond">VPN クライアント 起動済み？</FlowNode>
            <div style={{display:'flex', gap:60}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
                <div className="tiny" style={{color:'var(--ok)', fontWeight:700}}>YES</div>
                <FlowNode>② 認証ログを取得</FlowNode>
                <FlowArrow/>
                <FlowNode>③ 証明書を確認</FlowNode>
              </div>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
                <div className="tiny" style={{color:'var(--warn)', fontWeight:700}}>NO</div>
                <FlowNode kind="warn">クライアントを再起動</FlowNode>
                <FlowArrow/>
                <FlowNode>① に戻る</FlowNode>
              </div>
            </div>
            <FlowArrow/>
            <FlowNode kind="end">解決</FlowNode>
          </div>
        </div>
      </ModalShell>
    </div>
  </BrowserFrame>
);
const FlowNode = ({ kind = 'box', children }) => {
  const styles = {
    box:     { background:'#fff', border:'2px solid var(--ink-900)', padding:'8px 14px', borderRadius:6, fontSize:12, fontWeight:600 },
    diamond: { background:'#FEF9C3', border:'2px solid #EAB308', padding:'10px 18px', transform:'rotate(0)', clipPath:'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)', minWidth:200, minHeight:48, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11.5, fontWeight:700 },
    warn:    { background:'var(--warn-soft)', border:'2px solid var(--warn)', padding:'8px 14px', borderRadius:6, fontSize:12, fontWeight:600, color:'var(--warn)' },
    start:   { background:'var(--ink-900)', color:'#fff', padding:'8px 18px', borderRadius:99, fontSize:12, fontWeight:700 },
    end:     { background:'var(--accent)', color:'#fff', padding:'8px 18px', borderRadius:99, fontSize:12, fontWeight:700 },
  }[kind];
  return <div style={styles}>{children}</div>;
};
const FlowArrow = () => <div style={{width:2, height:18, background:'var(--ink-400)', position:'relative'}}><div style={{position:'absolute', bottom:-4, left:-3, width:0, height:0, borderLeft:'4px solid transparent', borderRight:'4px solid transparent', borderTop:'6px solid var(--ink-400)'}}/></div>;

// ============================================================================
// STEP EDITOR DETAIL — 画像注釈, リンク, 条件分岐
// ============================================================================
const StepEditorDetailPC = () => (
  <BrowserFrame url="mms.horizon-jit.example/m/MN-2407-003/edit" className="pat-b">
    <div style={{display:'flex', height:'100%', background:'#FAFAF6'}}>
      <aside style={{width:228, background:'var(--ink-900)'}}/>
      <main style={{flex:1, padding:'24px 32px', overflow:'auto'}}>
        <div className="label" style={{marginBottom:8}}>編集中: ステップ 04 詳細</div>
        <h2 style={{margin:'0 0 14px', fontSize:22, fontWeight:700, fontFamily:'var(--font-display)'}}>取込メニューから「一括取込」</h2>

        {/* Body */}
        <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'18px 22px', marginBottom:14}}>
          <div className="label" style={{marginBottom:6}}>本文</div>
          <div style={{fontSize:14, lineHeight:1.7, color:'var(--ink-800)'}}>画面右上の「取込」→「一括取込」を選択し、ダウンロードした ZIP を投入。</div>
        </div>

        {/* Annotated image */}
        <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'18px 22px', marginBottom:14}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
            <div className="label">画像 / 注釈</div>
            <div style={{display:'flex', gap:6}}>
              <button className="chip ghost" style={{border:0, cursor:'pointer', fontFamily:'inherit'}}>○ 矢印</button>
              <button className="chip accent" style={{border:0, cursor:'pointer', fontFamily:'inherit'}}>□ 四角</button>
              <button className="chip ghost" style={{border:0, cursor:'pointer', fontFamily:'inherit'}}>T テキスト</button>
              <button className="chip ghost" style={{border:0, cursor:'pointer', fontFamily:'inherit'}}>⌫ 削除</button>
            </div>
          </div>
          <div style={{position:'relative', height:280, background:'#fff', border:'1px solid var(--ink-200)', borderRadius:8}}>
            <div className="placeholder" style={{position:'absolute', inset:0, borderRadius:8, border:0}}>取込画面のスクリーンショット</div>
            {/* Annotations */}
            <div style={{position:'absolute', top:32, left:60, padding:'2px 8px', background:'var(--warn)', color:'#fff', fontSize:11, fontWeight:700, borderRadius:4}}>① 取込ボタン</div>
            <div style={{position:'absolute', top:42, left:160, width:80, height:30, border:'3px solid var(--warn)', borderRadius:4}}/>
            <div style={{position:'absolute', top:150, left:200, padding:'2px 8px', background:'var(--accent)', color:'#fff', fontSize:11, fontWeight:700, borderRadius:4}}>② 一括取込</div>
            <div style={{position:'absolute', top:160, left:300, width:130, height:42, border:'3px solid var(--accent)', borderRadius:4}}/>
          </div>
          <div style={{display:'flex', gap:8, marginTop:10}}>
            <button className="btn ghost"><I.image size={13}/> 画像を差し替え</button>
            <button className="btn ghost">注釈をリセット</button>
            <div style={{flex:1}}/>
            <span className="tiny muted">2 つの注釈</span>
          </div>
        </div>

        {/* Conditional branching */}
        <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'18px 22px', marginBottom:14}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div className="label">条件分岐 (オプション)</div>
            <button className="btn ghost"><I.plus size={13}/> 条件を追加</button>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center', padding:'10px 14px', background:'var(--ink-50)', borderRadius:8, marginBottom:8, fontSize:13}}>
            <span style={{padding:'2px 8px', background:'var(--ok-soft)', color:'var(--ok)', borderRadius:4, fontSize:11, fontWeight:700}}>差分なし</span>
            <span>→</span>
            <select defaultValue="next" style={{padding:'4px 8px', border:'1px solid var(--ink-200)', borderRadius:6, fontSize:12, fontFamily:'inherit'}}>
              <option value="next">次のステップへ</option>
              <option>ステップ 05 へジャンプ</option>
              <option>完了</option>
            </select>
            <div style={{flex:1}}/>
            <button style={{background:'transparent', border:0, cursor:'pointer', color:'var(--ink-400)'}}><I.trash size={14}/></button>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center', padding:'10px 14px', background:'var(--warn-soft)', borderRadius:8, fontSize:13}}>
            <span style={{padding:'2px 8px', background:'var(--warn)', color:'#fff', borderRadius:4, fontSize:11, fontWeight:700}}>差分あり</span>
            <span>→</span>
            <select defaultValue="jump" style={{padding:'4px 8px', border:'1px solid var(--ink-200)', borderRadius:6, fontSize:12, fontFamily:'inherit'}}>
              <option>次のステップへ</option>
              <option value="jump">差分確認 (ステップ 04b) へジャンプ</option>
              <option>担当者に確認</option>
            </select>
            <div style={{flex:1}}/>
            <button style={{background:'transparent', border:0, cursor:'pointer', color:'var(--ink-400)'}}><I.trash size={14}/></button>
          </div>
        </div>

        {/* Links */}
        <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'18px 22px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
            <div className="label">関連リンク</div>
            <button className="btn ghost"><I.plus size={13}/> リンク追加</button>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center', padding:'10px 14px', background:'var(--ink-50)', borderRadius:8, marginBottom:8, fontSize:13}}>
            <I.doc size={14} style={{color:'var(--ink-500)'}}/>
            <span style={{fontWeight:600}}>差分確認の運用ルール</span>
            <span className="chip" style={{fontSize:10, height:18}}>手順書</span>
            <span className="tiny muted" style={{fontFamily:'var(--font-mono)'}}>MN-2410-018</span>
            <div style={{flex:1}}/>
            <button style={{background:'transparent', border:0, cursor:'pointer', color:'var(--ink-400)'}}><I.trash size={14}/></button>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center', padding:'10px 14px', background:'var(--ink-50)', borderRadius:8, fontSize:13}}>
            <I.link size={14} style={{color:'var(--ink-500)'}}/>
            <span style={{fontWeight:600}}>基幹システム ログイン画面</span>
            <span className="chip" style={{fontSize:10, height:18}}>外部 URL</span>
            <span className="tiny muted" style={{fontFamily:'var(--font-mono)'}}>kkn.intra.local/login</span>
            <div style={{flex:1}}/>
            <button style={{background:'transparent', border:0, cursor:'pointer', color:'var(--ink-400)'}}><I.trash size={14}/></button>
          </div>
        </div>
      </main>
    </div>
  </BrowserFrame>
);

// ============================================================================
// STATES — 空 / 読み込み / エラー / 権限なし
// ============================================================================
const StatesBoard = () => {
  const Card = ({ title, desc, children }) => (
    <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:14, overflow:'hidden'}}>
      <div style={{padding:'14px 18px', borderBottom:'1px solid var(--ink-200)', background:'var(--ink-50)'}}>
        <div style={{fontWeight:700, fontSize:14}}>{title}</div>
        <div className="tiny muted" style={{marginTop:2}}>{desc}</div>
      </div>
      <div style={{height:280, position:'relative', background:'#FAFAF6'}}>{children}</div>
    </div>
  );

  return (
    <div className="pat-b" style={{width:'100%', height:'100%', background:'#FAFAF6', padding:'24px 28px', overflow:'auto'}}>
      <div className="label" style={{marginBottom:6, color:'var(--accent-ink)'}}>STATES</div>
      <h2 style={{margin:'0 0 18px', fontSize:22, fontWeight:700, letterSpacing:'-.01em'}}>状態別レイアウト</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <Card title="空状態 — 手順書がない" desc="まだ何も登録されていない">
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:20, gap:8}}>
            <div style={{width:56, height:56, borderRadius:14, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-ink)'}}><I.doc size={26}/></div>
            <div style={{fontSize:16, fontWeight:700, marginTop:6}}>まだ手順書がありません</div>
            <div className="muted" style={{fontSize:13, maxWidth:280}}>テンプレートから作るか、Drive から既存の JSON を読み込んで始めましょう。</div>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="btn primary"><I.plus size={13}/> 作成</button>
              <button className="btn ghost"><I.folder size={13}/> Drive から</button>
            </div>
          </div>
        </Card>
        <Card title="検索結果ゼロ" desc="該当する手順書が見つからない">
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:20, gap:8}}>
            <I.search size={32} style={{color:'var(--ink-400)'}}/>
            <div style={{fontSize:15, fontWeight:700, marginTop:6}}>「VPN設定」に該当する手順書はありません</div>
            <div className="muted" style={{fontSize:12, maxWidth:300}}>表記ゆれを試すか、新しい手順書を作成してください。「VPN 接続」「VPN ログイン」など。</div>
            <button className="btn primary" style={{marginTop:8}}><I.plus size={13}/> このキーワードで新規作成</button>
          </div>
        </Card>
        <Card title="読み込み中" desc="Drive からデータ取得">
          <div style={{position:'absolute', inset:0, padding:18, display:'flex', flexDirection:'column', gap:10}}>
            {[1,2,3].map(i=>(
              <div key={i} style={{display:'flex', gap:12, padding:'10px', background:'#fff', border:'1px solid var(--ink-200)', borderRadius:10}}>
                <div style={{width:50, height:50, background:'var(--ink-100)', borderRadius:7, animation:'pulse 1.6s infinite ease-in-out'}}/>
                <div style={{flex:1, display:'flex', flexDirection:'column', gap:6, justifyContent:'center'}}>
                  <div style={{height:9, width:'70%', background:'var(--ink-100)', borderRadius:99, animation:'pulse 1.6s infinite ease-in-out'}}/>
                  <div style={{height:8, width:'40%', background:'var(--ink-100)', borderRadius:99, animation:'pulse 1.6s infinite ease-in-out'}}/>
                </div>
              </div>
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
          </div>
        </Card>
        <Card title="エラー — Drive 同期失敗" desc="API エラーまたはネットワーク">
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:20, gap:8}}>
            <div style={{width:48, height:48, borderRadius:'50%', background:'var(--warn-soft)', color:'var(--warn)', display:'flex', alignItems:'center', justifyContent:'center'}}><I.warn size={22}/></div>
            <div style={{fontSize:15, fontWeight:700, marginTop:6}}>Drive と同期できませんでした</div>
            <div className="muted" style={{fontSize:12, maxWidth:300}}>ネットワーク接続を確認するか、もう一度サインインしてください。<br/>エラーコード: <code style={{fontFamily:'var(--font-mono)'}}>DRIVE_AUTH_403</code></div>
            <div style={{display:'flex', gap:8, marginTop:8}}>
              <button className="btn ghost">詳細を見る</button>
              <button className="btn primary">再試行</button>
            </div>
          </div>
        </Card>
        <Card title="権限なし — Drive 未接続" desc="Google サインインが必要">
          <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:20, gap:8}}>
            <div style={{width:48, height:48, borderRadius:'50%', background:'var(--info-soft)', color:'var(--info)', display:'flex', alignItems:'center', justifyContent:'center'}}><I.folder size={22}/></div>
            <div style={{fontSize:15, fontWeight:700, marginTop:6}}>Drive にサインインしてください</div>
            <div className="muted" style={{fontSize:12, maxWidth:300}}>手順書を読み込むには Google アカウントで認証が必要です。</div>
            <button className="btn primary" style={{marginTop:8}}>Google でサインイン</button>
          </div>
        </Card>
        <Card title="保存に失敗 (オフライン)" desc="ローカルに退避中">
          <div style={{position:'absolute', inset:0, padding:18, display:'flex', flexDirection:'column', justifyContent:'center', gap:14}}>
            <div style={{background:'var(--warn-soft)', borderLeft:'3px solid var(--warn)', borderRadius:7, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start'}}>
              <I.warn size={16} style={{color:'var(--warn)'}}/>
              <div>
                <div style={{fontSize:13, fontWeight:700, color:'var(--warn)'}}>オフライン: ローカルに保存中</div>
                <div className="tiny muted" style={{marginTop:2, color:'var(--ink-600)'}}>変更内容は端末に保持されています。オンライン復帰時に自動同期します。</div>
              </div>
            </div>
            <div className="tiny muted">最終オンライン: 14:08 · 未同期 3 件</div>
            <button className="btn ghost" style={{width:200}}>今すぐ再同期</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

window.bExtras = {
  DraftsPC, NewBlankPC, SignInPC,
  HelpModalPC, DriveFolderPickerPC, DriveJsonPickerPC,
  ShareLinkModalPC, VersionHistoryModalPC, ViewHistoryModalPC, FlowchartModalPC,
  StepEditorDetailPC, StatesBoard,
};
