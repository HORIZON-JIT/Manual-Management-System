// B案 PC 画面群

const { sampleInstructions, sampleSteps, BrowserFrame, I,
  officialCategories, getCategoryDisplay, getPendingCategories, getOfficialCounts, CategoryChip } = window.shared;
const { ShellPC } = window.bShared;

const detailManual = {
  ...sampleInstructions[2], // VPN
  desc: '社内 VPN に接続できない / 切断される際の Tier1 切り分け手順。まずは本書のチェックリストを上から順に確認してください。',
  steps: sampleSteps,
  tags: ['VPN','障害','Tier1','情シス'],
};

// — Helper: highlight search query in text —
const Hi = ({ text, q }) => {
  if (!q) return <>{text}</>;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = String(text).split(re);
  return <>{parts.map((p, i) =>
    p.toLowerCase() === q.toLowerCase()
      ? <mark key={i} style={{background:'#FEF08A', color:'inherit', padding:'1px 2px', borderRadius:3}}>{p}</mark>
      : <span key={i}>{p}</span>
  )}</>;
};

// ============================================================================
// HOME
// ============================================================================
const HomePC = ({ onGo, query, onQuery }) => (
  <div style={{padding:'32px 48px 40px'}}>
    {/* Top right */}
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
      <div style={{display:'inline-flex', background:'#fff', border:'1px solid var(--ink-200)', borderRadius:10, padding:3}}>
        <button style={{padding:'7px 16px', borderRadius:7, border:0, background:'var(--ink-900)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>現場担当者</button>
        <button style={{padding:'7px 16px', borderRadius:7, border:0, background:'transparent', color:'var(--ink-600)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit'}}>管理者</button>
      </div>
      <button onClick={()=>onGo('edit')} className="btn primary"><I.plus size={14}/> 作成</button>
    </div>

    {/* Hero */}
    <div style={{marginBottom:32}}>
      <div className="muted" style={{fontSize:12, marginBottom:6}}>2026年 5月17日 日曜日</div>
      <h1 style={{margin:'0 0 8px', fontSize:32, fontWeight:700, letterSpacing:'-.015em'}}>こんにちは、谷さん</h1>
      <div className="muted" style={{fontSize:14, marginBottom:22}}>探したい手順書のキーワードを入力 — タイトル・本文・タグから探せます。</div>
      <form onSubmit={(e)=>{e.preventDefault(); onGo('search');}} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:14, padding:'14px 18px', display:'flex', alignItems:'center', gap:12, boxShadow:'var(--shadow-2)'}}>
        <I.search size={20}/>
        <input value={query} onChange={e=>onQuery(e.target.value)}
          placeholder="例: VPN 接続できない、月次経費、新入社員"
          style={{flex:1, border:0, outline:0, fontSize:15, fontFamily:'inherit', background:'transparent'}}/>
        <span className="chip ghost" style={{fontFamily:'var(--font-mono)'}}>⌘ K</span>
      </form>
      <div style={{display:'flex', gap:6, marginTop:14, flexWrap:'wrap', alignItems:'center'}}>
        <span className="tiny muted" style={{padding:'4px 0'}}>よく検索される:</span>
        {['VPN','経費精算','PC初期設定','プロジェクター','入退室カード'].map(t=>(
          <button key={t} onClick={()=>{onQuery(t); onGo('search');}} className="chip ghost" style={{border:0, cursor:'pointer', fontFamily:'inherit'}}>{t}</button>
        ))}
      </div>
    </div>

    {/* Continue from */}
    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14}}>
      <div style={{fontWeight:700, fontSize:18}}>続きから</div>
      <button onClick={()=>onGo('list')} className="tiny muted" style={{background:'transparent', border:0, cursor:'pointer', fontFamily:'inherit'}}>すべて表示 →</button>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14, marginBottom:32}}>
      {sampleInstructions.slice(0,3).map(it=>(
        <button key={it.id} onClick={()=>onGo('detail')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column', textAlign:'left', cursor:'pointer', fontFamily:'inherit', padding:0}}>
          <div className="placeholder" style={{height:84, borderRadius:0, border:0, borderBottom:'1px solid var(--ink-200)'}}>表紙画像</div>
          <div style={{padding:'14px 16px', width:'100%'}}>
            <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
              <CategoryChip raw={it.category}/>
              <span className="tiny muted" style={{marginLeft:'auto', fontFamily:'var(--font-mono)'}}>{it.version}</span>
            </div>
            <div style={{fontWeight:700, fontSize:14, marginBottom:6, lineHeight:1.4}}>{it.title}</div>
            <div className="tiny muted">途中: ステップ 3 / {it.steps}</div>
            <div style={{height:4, background:'var(--ink-100)', borderRadius:99, marginTop:8, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${(3/it.steps)*100}%`, background:'var(--accent)'}}/>
            </div>
          </div>
        </button>
      ))}
    </div>

    {/* Recommended */}
    <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:14}}>
      <div style={{fontWeight:700, fontSize:18}}>あなたの部署でよく見られる</div>
      <span className="tiny muted">情シス · 今月</span>
    </div>
    <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12}}>
      {sampleInstructions.slice(2,6).map(it=>(
        <button key={it.id} onClick={()=>onGo('detail')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'14px 14px', textAlign:'left', cursor:'pointer', fontFamily:'inherit'}}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
            <CategoryChip raw={it.category}/>
            {it.pinned && <I.pin filled/>}
          </div>
          <div style={{fontWeight:700, fontSize:13, marginBottom:8, lineHeight:1.4, minHeight:36}}>{it.title}</div>
          <div className="tiny muted">{it.views} 閲覧 · {it.updated}</div>
        </button>
      ))}
    </div>
  </div>
);

// ============================================================================
// LIST
// ============================================================================
const ListPC = ({ onGo, query }) => (
  <div>
    <div style={{padding:'18px 32px 14px', borderBottom:'1px solid var(--ink-200)', background:'#fff'}}>
      <div style={{display:'flex', gap:6, marginBottom:10, overflowX:'auto'}}>
        {['すべて','事務作業','情報システム','現場作業','安全','機材','オンボーディング'].map((c,i)=>(
          <button key={c} className={i===0?'chip accent':'chip ghost'} style={{flexShrink:0, height:28, padding:'0 12px', fontSize:12, border:0, cursor:'pointer', fontFamily:'inherit'}}>{c}</button>
        ))}
      </div>
      <div style={{display:'flex', alignItems:'center', gap:10, fontSize:12, color:'var(--ink-500)'}}>
        <span><b style={{color:'var(--ink-900)'}}>124</b> 件 · 更新日順</span>
        <span className="chip ghost">期間 1ヶ月以内 ×</span>
        <span className="chip ghost">部署 情シス ×</span>
        <button className="chip ghost" style={{border:0, cursor:'pointer', fontFamily:'inherit'}}>+ フィルタ追加</button>
        <span style={{marginLeft:'auto'}}>表示</span>
        <div style={{display:'inline-flex', border:'1px solid var(--ink-200)', borderRadius:7, padding:2}}>
          <button style={{padding:'4px 8px', borderRadius:5, background:'transparent', border:0, color:'var(--ink-500)', cursor:'pointer'}}><I.list size={14}/></button>
          <button style={{padding:'4px 8px', borderRadius:5, background:'var(--ink-900)', color:'#fff', border:0, cursor:'pointer'}}><I.grid size={14}/></button>
        </div>
      </div>
    </div>
    <div style={{padding:'22px 32px'}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {sampleInstructions.map(it=>(
          <button key={it.id} onClick={()=>onGo('detail')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column', textAlign:'left', cursor:'pointer', fontFamily:'inherit', padding:0, transition:'all .15s'}}>
            <div className="placeholder" style={{height:120, borderRadius:0, border:0, borderBottom:'1px solid var(--ink-200)'}}>表紙画像</div>
            <div style={{padding:'14px 16px', flex:1, display:'flex', flexDirection:'column', width:'100%'}}>
              <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
                <CategoryChip raw={it.category}/>
                {it.pinned && <I.pin filled size={12}/>}
                <span className="tiny muted" style={{marginLeft:'auto', fontFamily:'var(--font-mono)'}}>{it.version}</span>
              </div>
              <div style={{fontWeight:700, fontSize:14, lineHeight:1.45, marginBottom:10, minHeight:40}}>{it.title}</div>
              <div className="tiny muted">{it.author} · {it.dept}</div>
              <div className="tiny muted" style={{marginTop:4, display:'flex', justifyContent:'space-between'}}>
                <span>{it.updated}</span><span>{it.views} 閲覧</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// SEARCH RESULTS (with keyword highlight)
// ============================================================================
const SearchPC = ({ onGo, query }) => {
  const q = (query || 'VPN').trim();
  const results = [
    { ...sampleInstructions[2], snippet: '社内 VPN 接続トラブル対応 — Tier1 切り分け手順。SSL-VPN クライアント側の問題か、認証サーバ側の問題かを判別。', match: ['title','body','tag'] },
    { ...sampleInstructions[3], snippet: '新入社員アカウント発行 — 配属部署のフォルダ権限を付与した後、VPN 用クライアント証明書をインストール。', match: ['body'] },
    { id: 'MN-2210-005', title: 'リモートワーク機器 持出申請', category: '事務作業', author: '小林 颯', dept: '管理部', updated: '2026-02-18', version: 'v1.0', steps: 4, snippet: '社外利用時の VPN 接続については別途「VPN 接続トラブル対応」を参照。週次でログを提出。', match: ['body'] },
  ];

  return (
    <div style={{padding:'24px 32px 40px'}}>
      <div style={{display:'flex', alignItems:'baseline', gap:14, marginBottom:6}}>
        <h1 style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:'-.01em'}}>
          「<span style={{color:'var(--accent-ink)'}}>{q}</span>」の検索結果
        </h1>
        <span className="muted" style={{fontSize:13}}>{results.length} 件 · 全 124 件中</span>
      </div>
      <div className="muted" style={{fontSize:12, marginBottom:18}}>関連度が高い順に表示しています。検索対象: タイトル / 本文 / タグ / キーワード</div>

      <div style={{display:'grid', gridTemplateColumns:'200px 1fr', gap:24}}>
        {/* facet rail */}
        <aside>
          <div className="label" style={{marginBottom:8}}>絞り込み</div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>カテゴリ</div>
            {[['情報システム',2,true],['事務作業',1,false]].map(([c, n, on])=>(
              <label key={c} style={{display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:13, cursor:'pointer'}}>
                <input type="checkbox" defaultChecked={on} style={{accentColor:'var(--accent)'}}/>
                <span style={{flex:1}}>{c}</span>
                <span className="tiny muted">{n}</span>
              </label>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>マッチ箇所</div>
            {[['本文に含む',3],['タイトルに含む',1],['タグに含む',1]].map(([c, n])=>(
              <label key={c} style={{display:'flex', alignItems:'center', gap:8, padding:'5px 0', fontSize:13}}>
                <input type="checkbox" defaultChecked style={{accentColor:'var(--accent)'}}/>
                <span style={{flex:1}}>{c}</span>
                <span className="tiny muted">{n}</span>
              </label>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>更新日</div>
            {['今週','1ヶ月以内','3ヶ月以内','すべて'].map((c,i)=>(
              <label key={c} style={{display:'flex', alignItems:'center', gap:8, padding:'4px 0', fontSize:13}}>
                <input type="radio" name="upd" defaultChecked={i===3} style={{accentColor:'var(--accent)'}}/>{c}
              </label>
            ))}
          </div>
          <div className="divider" style={{margin:'14px 0'}}/>
          <div className="tiny muted" style={{lineHeight:1.6}}>
            検索のコツ — 「<b>VPN 認証</b>」のようにスペース区切りで AND 検索。「<code style={{fontFamily:'var(--font-mono)', background:'var(--ink-100)', padding:'1px 4px', borderRadius:3}}>tag:VPN</code>」でタグ限定。
          </div>
        </aside>

        {/* results */}
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {results.map((r, idx)=>(
            <button key={r.id} onClick={()=>onGo('detail')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'18px 22px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', display:'flex', gap:18}}>
              <div className="placeholder" style={{width:88, height:88, borderRadius:8, border:0, fontSize:0, flexShrink:0}}/>
              <div style={{flex:1, minWidth:0}}>
                <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6}}>
                  <CategoryChip raw={r.category}/>
                  <span className="tiny muted" style={{fontFamily:'var(--font-mono)'}}>{r.version}</span>
                  {r.match.map(m => <span key={m} className="chip ghost" style={{fontSize:10}}>{m === 'title' ? 'タイトル' : m === 'body' ? '本文' : 'タグ'}</span>)}
                  <span className="tiny muted" style={{marginLeft:'auto'}}>関連度 {[97,82,64][idx]}%</span>
                </div>
                <div style={{fontWeight:700, fontSize:15, marginBottom:6, lineHeight:1.4}}><Hi text={r.title} q={q}/></div>
                <div style={{fontSize:13, color:'var(--ink-700)', lineHeight:1.7, marginBottom:8}}>…<Hi text={r.snippet} q={q}/>…</div>
                <div className="tiny muted">{r.author} · {r.dept} · 更新 {r.updated}</div>
              </div>
            </button>
          ))}

          <div style={{padding:'20px 22px', background:'#fff', border:'1px dashed var(--ink-300)', borderRadius:12, fontSize:13, color:'var(--ink-600)', textAlign:'center', marginTop:6}}>
            この検索キーワードで関連する手順書がないですか？ <button onClick={()=>onGo('edit')} style={{background:'transparent', border:0, color:'var(--accent-ink)', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>「{q}」で新規作成 →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// DETAIL
// ============================================================================
const DetailPC = ({ onGo }) => {
  const [openStep, setOpenStep] = React.useState(2);
  const m = detailManual;

  return (
    <div>
      {/* hero */}
      <div style={{padding:'24px 48px 18px', borderBottom:'1px solid var(--ink-200)', background:'#fff'}}>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:10}}>
          <CategoryChip raw={m.category} size="lg"/>
          {m.tags.slice(0,3).map(t=> <span key={t} className="chip ghost">#{t}</span>)}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 220px', gap:24, alignItems:'flex-start'}}>
          <div>
            <h1 style={{margin:'0 0 10px', fontSize:28, fontWeight:700, letterSpacing:'-.01em', lineHeight:1.25}}>{m.title}</h1>
            <div className="muted" style={{fontSize:14, lineHeight:1.7, maxWidth:640}}>{m.desc}</div>
            <div style={{display:'flex', alignItems:'center', gap:16, marginTop:14, fontSize:12}}>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                <div style={{width:26, height:26, borderRadius:'50%', background:'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700}}>山</div>
                <div><b>{m.author}</b> <span className="muted">/ {m.dept}</span></div>
              </div>
              <div className="muted">最終更新 {m.updated}</div>
              <div style={{fontFamily:'var(--font-mono)', fontWeight:700}}>{m.version}</div>
              <div className="muted">{m.views} 閲覧</div>
              <div className="muted" style={{fontFamily:'var(--font-mono)'}}>{m.id}</div>
            </div>
          </div>
          <div style={{background:'var(--ink-50)', border:'1px solid var(--ink-200)', borderRadius:12, padding:14}}>
            <div className="label" style={{marginBottom:4}}>進捗</div>
            <div style={{fontSize:22, fontWeight:800, fontFamily:'var(--font-display)'}}>2 <span style={{color:'var(--ink-400)', fontWeight:500}}>/ {m.steps.length}</span></div>
            <div style={{height:5, background:'var(--ink-100)', borderRadius:99, marginTop:8, overflow:'hidden'}}>
              <div style={{height:'100%', width:`${(2/m.steps.length)*100}%`, background:'var(--accent)'}}/>
            </div>
            <div style={{display:'flex', gap:6, marginTop:12}}>
              <button className="btn ghost" style={{flex:1, height:32, fontSize:12}}><I.star/> ピン</button>
              <button className="btn ghost" style={{flex:1, height:32, fontSize:12}}><I.share/></button>
              <button className="btn ghost" style={{height:32, fontSize:12, padding:'0 10px'}}><I.print/></button>
            </div>
            <button onClick={()=>onGo('edit')} className="btn primary" style={{width:'100%', marginTop:8, height:34, fontSize:12}}><I.edit size={13}/> 編集する</button>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={{display:'flex', padding:'0 48px', borderBottom:'1px solid var(--ink-200)', background:'#fff', gap:0}}>
        {[['手順',true],['フローチャート'],['更新履歴'],['添付ファイル'],['関連手順']].map(([label, active])=>(
          <button key={label} style={{padding:'12px 16px', borderBottom: active?'2px solid var(--accent)':'2px solid transparent', color: active?'var(--accent-ink)':'var(--ink-500)', fontSize:13, fontWeight:600, background:'transparent', border:0, cursor:'pointer', fontFamily:'inherit', marginBottom:-1}}>{label}</button>
        ))}
      </div>

      {/* steps */}
      <div style={{padding:'24px 48px', background:'#FAFAF6'}}>
        <div style={{maxWidth:780}}>
          {m.steps.map((s, i)=>{
            const done = i < 2;
            const open = openStep === i;
            return (
              <div key={i} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:14, marginBottom:10, overflow:'hidden'}}>
                <button onClick={()=>setOpenStep(open ? -1 : i)} style={{width:'100%', display:'flex', alignItems:'center', gap:12, padding:'16px 22px', background:'transparent', border:0, cursor:'pointer', fontFamily:'inherit', textAlign:'left'}}>
                  <div style={{width:28, height:28, borderRadius:8, background: done?'var(--accent)':(open?'var(--ink-900)':'var(--ink-100)'), color: done||open?'#fff':'var(--ink-700)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, flexShrink:0}}>
                    {done ? <I.check size={14}/> : String(i+1).padStart(2,'0')}
                  </div>
                  <h2 style={{margin:0, fontSize:15, fontWeight:700, flex:1}}>{s.title}</h2>
                  <span className="tiny muted">{i+1} / {m.steps.length}</span>
                  <I.chevDown style={{transform: open?'rotate(180deg)':'none', transition:'transform .2s'}}/>
                </button>
                {open && (
                  <div style={{padding:'4px 22px 22px 62px', borderTop:'1px solid var(--ink-100)'}}>
                    <div className="prose" style={{paddingTop:14}}>
                      <p>{s.body}</p>
                      {s.caution && (
                        <div style={{background:'var(--warn-soft)', borderRadius:8, padding:'10px 12px', display:'flex', gap:10, alignItems:'flex-start', fontSize:13, color:'var(--warn)', borderLeft:'3px solid var(--warn)'}}>
                          <I.warn size={16}/><div><b>注意:</b> {s.caution}</div>
                        </div>
                      )}
                      {s.checks && (
                        <div style={{marginTop:10}}>
                          <div className="label" style={{marginBottom:6}}>チェック</div>
                          {s.checks.map((c,j)=>(
                            <label key={j} style={{display:'flex', gap:8, alignItems:'center', fontSize:13, padding:'5px 0', cursor:'pointer'}}>
                              <input type="checkbox" defaultChecked={i===0} style={{accentColor:'var(--accent)'}}/>{c}
                            </label>
                          ))}
                        </div>
                      )}
                      {i===3 && <div className="placeholder" style={{height:180, marginTop:12}}>取込メニューのスクリーンショット</div>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EDIT
// ============================================================================
const EditPC = ({ onGo }) => {
  const m = detailManual;
  const [activeStep, setActiveStep] = React.useState(2);
  return (
    <div>
      {/* secondary toolbar */}
      <div style={{padding:'10px 32px', borderBottom:'1px solid var(--ink-200)', background:'#fff', display:'flex', alignItems:'center', gap:14}}>
        <span className="chip" style={{fontFamily:'var(--font-mono)'}}>{m.id}</span>
        <span style={{display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:'var(--ok)'}}>
          <span className="dot" style={{background:'var(--ok)'}}/>自動保存済み 14:32
        </span>
        <span className="tiny muted">{m.version} → v3.2 草案</span>
        <div style={{flex:1}}/>
        <button onClick={()=>onGo('detail')} className="btn ghost">← 閲覧に戻る</button>
        <button className="btn ghost">プレビュー</button>
        <button onClick={()=>onGo('detail')} className="btn primary">公開する</button>
      </div>

      <div style={{display:'flex'}}>
        {/* steps outline */}
        <aside style={{width:240, background:'#fff', borderRight:'1px solid var(--ink-200)', padding:18, minHeight:'calc(100vh - 110px)'}}>
          <div className="label" style={{marginBottom:10}}>ステップ</div>
          <div style={{display:'flex', flexDirection:'column', gap:2}}>
            {m.steps.map((s,i)=>(
              <button key={i} onClick={()=>setActiveStep(i)} style={{display:'flex', alignItems:'center', gap:8, padding:'9px 10px', borderRadius:8, fontSize:13, background: i===activeStep?'var(--accent-soft)':'transparent', color: i===activeStep?'var(--accent-ink)':'inherit', border:0, cursor:'pointer', fontFamily:'inherit', textAlign:'left', width:'100%'}}>
                <I.drag size={12} style={{color:'var(--ink-400)'}}/>
                <span style={{fontFamily:'var(--font-mono)', fontSize:11, color: i===activeStep?'var(--accent-ink)':'var(--ink-400)', flexShrink:0}}>{String(i+1).padStart(2,'0')}</span>
                <span style={{flex:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight: i===activeStep?700:500}}>{s.title}</span>
              </button>
            ))}
          </div>
          <button className="btn ghost" style={{width:'100%', marginTop:12, height:34, fontSize:12}}><I.plus size={13}/> ステップ追加</button>
          <div className="divider" style={{margin:'18px 0'}}/>
          <div className="label" style={{marginBottom:8}}>プロパティ</div>
          <div style={{fontSize:12}}>
            <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}><span className="muted">カテゴリ</span><b>{m.category}</b></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}><span className="muted">作成者</span><b>{m.author}</b></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}><span className="muted">公開範囲</span><b>社内</b></div>
            <div style={{display:'flex', justifyContent:'space-between', padding:'5px 0'}}><span className="muted">Drive 同期</span><b style={{color:'var(--ok)'}}>有効</b></div>
          </div>
        </aside>

        {/* editor */}
        <main style={{flex:1, padding:'24px 32px', background:'#FAFAF6'}}>
          <div style={{maxWidth:720, margin:'0 auto'}}>
            <div style={{display:'flex', gap:6, marginBottom:12, alignItems:'center'}}>
              <CategoryCombobox value={m.category}/>
              {m.tags.map(t=> <span key={t} className="chip ghost">#{t} ×</span>)}
              <span className="chip ghost">+ タグ</span>
            </div>
            <input defaultValue={m.title} style={{width:'100%', border:0, outline:0, fontSize:30, fontWeight:700, padding:'4px 0', letterSpacing:'-.01em', marginBottom:6, fontFamily:'var(--font-display)', background:'transparent'}}/>
            <textarea defaultValue={m.desc} style={{width:'100%', border:0, outline:0, fontSize:14, color:'var(--ink-500)', resize:'none', minHeight:46, lineHeight:1.6, fontFamily:'inherit', background:'transparent'}}/>
            <div className="divider" style={{margin:'14px 0'}}/>

            {m.steps.map((s, i)=>{
              const focus = i === activeStep;
              return (
                <div key={i} style={{display:'flex', gap:12, marginBottom:14}}>
                  <div style={{width:30, paddingTop:6, color:'var(--ink-400)', display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
                    <I.drag size={14}/>
                    <div style={{fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700}}>{String(i+1).padStart(2,'0')}</div>
                  </div>
                  <div style={{flex:1, background: focus?'#fff':'transparent', borderRadius:10, padding: focus?'16px 18px':'10px 0', border: focus?'1px solid var(--accent)':'1px solid transparent', boxShadow: focus?'0 0 0 4px var(--accent-soft)':'none'}}>
                    <input defaultValue={s.title} style={{width:'100%', border:0, outline:0, fontSize:17, fontWeight:700, padding:'2px 0', background:'transparent', fontFamily:'inherit'}}/>
                    <div style={{fontSize:14, color:'var(--ink-700)', lineHeight:1.7, marginTop:6}}>{s.body}</div>
                    {s.caution && focus && (
                      <div style={{background:'var(--warn-soft)', borderRadius:7, padding:'8px 12px', marginTop:10, display:'flex', alignItems:'flex-start', gap:8, fontSize:13, color:'var(--warn)', borderLeft:'3px solid var(--warn)'}}>
                        <I.warn size={14}/><div>{s.caution}</div>
                      </div>
                    )}
                    {focus && (
                      <div style={{marginTop:12, paddingTop:10, borderTop:'1px dashed var(--ink-300)'}}>
                        <div className="tiny muted" style={{marginBottom:6}}>/ でブロックを追加</div>
                        <div style={{display:'flex', gap:6, flexWrap:'wrap'}}>
                          {[['見出し', <I.doc size={13}/>],['注意', <I.warn size={13}/>],['チェック', <I.check size={13}/>],['画像', <I.image size={13}/>],['ファイル', <I.attach size={13}/>],['関連手順', <I.link size={13}/>]].map(([l, ic])=>(
                            <button key={l} className="chip ghost" style={{cursor:'pointer', border:0, fontFamily:'inherit'}}>{ic} {l}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div style={{paddingLeft:42, color:'var(--ink-400)', fontSize:14, cursor:'pointer'}}>+ ステップ追加</div>
          </div>
        </main>
      </div>
    </div>
  );
};

// ============================================================================
// CategoryCombobox — 編集画面で使用。既存カテゴリから選ぶ＋自由入力可
// ============================================================================
const CategoryCombobox = ({ value }) => {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState(value || '');
  const display = getCategoryDisplay(input);
  const matches = officialCategories.filter(c => c.id.includes(input) || input === '');
  return (
    <div style={{position:'relative', display:'inline-block'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{display:'inline-flex', alignItems:'center', gap:6, padding:'0 10px', height:26, borderRadius:999, border: display.official ? 0 : '1px dashed #EAB308', background: display.official ? 'var(--accent-soft)' : '#FEF9C3', color: display.official ? 'var(--accent-ink)' : '#92400E', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit'}}>
        {!display.official && <I.warn size={10}/>}
        <span style={{width:6, height:6, borderRadius:'50%', background: display.color, display: display.official ? 'inline-block':'none'}}/>
        {display.label}
        <I.chevDown size={11}/>
      </button>
      {open && (
        <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, background:'#fff', border:'1px solid var(--ink-200)', borderRadius:10, boxShadow:'var(--shadow-2)', minWidth:240, padding:6, zIndex:20}}>
          <div style={{padding:'6px 10px 8px'}}>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="検索 / 自由入力..." style={{width:'100%', padding:'6px 8px', border:'1px solid var(--ink-200)', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none'}}/>
          </div>
          <div style={{fontSize:10, fontWeight:700, letterSpacing:'.08em', color:'var(--ink-500)', padding:'4px 12px'}}>公式カテゴリ</div>
          {matches.map(c => (
            <button key={c.id} onClick={()=>{setInput(c.id); setOpen(false);}} style={{display:'flex', alignItems:'center', gap:8, width:'100%', padding:'7px 12px', border:0, background: c.id === input ? 'var(--accent-soft)' : 'transparent', cursor:'pointer', fontFamily:'inherit', borderRadius:5, textAlign:'left'}}>
              <span style={{width:8, height:8, borderRadius:'50%', background: c.color}}/>
              <span style={{flex:1, fontSize:13}}>{c.label}</span>
              <span className="tiny muted">{c.desc}</span>
            </button>
          ))}
          {input && !officialCategories.find(c=>c.id===input) && (
            <>
              <div style={{height:1, background:'var(--ink-200)', margin:'6px 0'}}/>
              <div style={{padding:'7px 12px 4px', fontSize:12, color:'var(--warn)'}}>
                <I.warn size={11}/> <b>「{input}」</b>を新規（未承認）として保存
                <div className="tiny muted" style={{marginTop:3, color:'var(--ink-500)'}}>管理者の承認後に公式カテゴリに昇格します</div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// AdminCategoriesPC — 未承認カテゴリの承認・統合キュー
// ============================================================================
const AdminCategoriesPC = ({ onGo }) => {
  const pending = getPendingCategories(sampleInstructions);
  const official = getOfficialCounts(sampleInstructions);

  return (
    <div>
      <div style={{padding:'22px 32px 18px', borderBottom:'1px solid var(--ink-200)', background:'#fff'}}>
        <div className="label" style={{marginBottom:4, color:'var(--warn)'}}>管理者ビュー</div>
        <h1 style={{margin:'0 0 6px', fontSize:24, fontWeight:700, letterSpacing:'-.01em'}}>カテゴリ承認キュー</h1>
        <div className="muted" style={{fontSize:13, maxWidth:680, lineHeight:1.7}}>
          Drive 上の手順書 JSON から、公式カテゴリ・別名どちらにも該当しない <code style={{fontFamily:'var(--font-mono)', background:'var(--ink-100)', padding:'1px 5px', borderRadius:3}}>category</code> 値が <b>{pending.length} 種類 / {pending.reduce((s,p)=>s+p.count,0)} 件</b>あります。承認するか、既存カテゴリに統合してください。
        </div>
      </div>

      <div style={{padding:'24px 32px', display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
        {/* Queue */}
        <div>
          <div className="label" style={{marginBottom:10}}>未承認のカテゴリ値</div>
          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {pending.map(p => {
              const items = sampleInstructions.filter(it => (it.category || '(未分類)') === p.id);
              return (
                <div key={p.id} style={{background:'#fff', border:'1px solid #FEF08A', borderLeft:'4px solid #EAB308', borderRadius:12, padding:'16px 20px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
                    <I.warn size={16} style={{color:'#92400E'}}/>
                    <code style={{fontFamily:'var(--font-mono)', fontSize:14, fontWeight:700, background:'#FEF9C3', padding:'2px 8px', borderRadius:4, color:'#92400E'}}>"{p.id}"</code>
                    <span className="tiny muted">{p.count} 件の手順書で使用</span>
                    <div style={{flex:1}}/>
                    <button className="btn primary" style={{height:30, fontSize:12}}><I.check size={13}/> このまま公式化</button>
                    <button className="btn ghost" style={{height:30, fontSize:12}}>既存に統合 ▾</button>
                    <button className="btn ghost" style={{height:30, fontSize:12, padding:'0 8px'}}><I.more size={14}/></button>
                  </div>
                  <div style={{paddingTop:10, borderTop:'1px solid var(--ink-100)'}}>
                    <div className="tiny muted" style={{marginBottom:6}}>該当する手順書</div>
                    {items.map(it => (
                      <button key={it.id} onClick={()=>onGo('detail')} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 0', width:'100%', background:'transparent', border:0, cursor:'pointer', fontFamily:'inherit', textAlign:'left', borderBottom:'1px solid var(--ink-100)'}}>
                        <I.doc size={14} style={{color:'var(--ink-400)'}}/>
                        <span style={{fontSize:13, fontWeight:600, flex:1}}>{it.title}</span>
                        <span className="tiny muted">{it.author}</span>
                        <span className="tiny muted" style={{fontFamily:'var(--font-mono)', minWidth:50, textAlign:'right'}}>{it.version}</span>
                        <I.chevR size={14} style={{color:'var(--ink-400)'}}/>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar — official taxonomy */}
        <aside>
          <div className="label" style={{marginBottom:10}}>公式カテゴリ</div>
          <div style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'4px 0'}}>
            {official.map(c => (
              <div key={c.id} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid var(--ink-100)'}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:c.color, flexShrink:0}}/>
                <div style={{flex:1}}>
                  <div style={{fontSize:13, fontWeight:700}}>{c.label}</div>
                  <div className="tiny muted">{c.desc}</div>
                </div>
                <div style={{fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, color:'var(--ink-500)'}}>{c.count}</div>
              </div>
            ))}
          </div>
          <button className="btn ghost" style={{width:'100%', marginTop:10}}><I.plus size={13}/> 公式カテゴリを追加</button>
          <div className="divider" style={{margin:'18px 0'}}/>
          <div className="label" style={{marginBottom:8}}>エイリアス（自動マッピング）</div>
          <div style={{fontSize:12, lineHeight:1.8, color:'var(--ink-600)'}}>
            <div><code style={{fontFamily:'var(--font-mono)', background:'var(--ink-100)', padding:'1px 5px', borderRadius:3}}>pc_work</code> → 事務作業</div>
            <div><code style={{fontFamily:'var(--font-mono)', background:'var(--ink-100)', padding:'1px 5px', borderRadius:3}}>packing</code> → 現場作業</div>
            <div><code style={{fontFamily:'var(--font-mono)', background:'var(--ink-100)', padding:'1px 5px', borderRadius:3}}>PC事務作業</code> → 事務作業</div>
            <div><code style={{fontFamily:'var(--font-mono)', background:'var(--ink-100)', padding:'1px 5px', borderRadius:3}}>梱包作業</code> → 現場作業</div>
          </div>
          <button className="btn ghost" style={{width:'100%', marginTop:10}}><I.plus size={13}/> エイリアスを追加</button>
        </aside>
      </div>
    </div>
  );
};

window.bPC = { HomePC, ListPC, SearchPC, DetailPC, EditPC, AdminCategoriesPC, CategoryCombobox, Hi };
