// B案 Mobile 画面群

const { sampleInstructions, sampleSteps, PhoneFrame, I, CategoryChip, getCategoryDisplay } = window.shared;
const { ShellMobile } = window.bShared;
const { Hi } = window.bPC;

const mDetail = {
  ...sampleInstructions[2],
  desc: '社内 VPN に接続できない / 切断される際の Tier1 切り分け手順。まずは本書のチェックリストを上から順に確認してください。',
  steps: sampleSteps,
  tags: ['VPN','障害','Tier1','情シス'],
};

// ============================================================================
// HOME (Mobile)
// ============================================================================
const HomeMobile = ({ onGo, query, onQuery }) => (
  <>
    <div style={{padding:'4px 18px 14px', background:'#FAFAF6'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <div style={{width:30, height:30, borderRadius:7, background:'var(--ink-900)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13}}>M</div>
          <div>
            <div style={{fontWeight:700, fontSize:13}}>手順書管理</div>
            <div className="tiny muted" style={{fontFamily:'var(--font-mono)', fontSize:9}}>HORIZON-JIT</div>
          </div>
        </div>
        <div style={{width:30, height:30, borderRadius:'50%', background:'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11}}>YT</div>
      </div>
      <div style={{display:'inline-flex', background:'#fff', border:'1px solid var(--ink-200)', borderRadius:9, padding:2, marginBottom:14}}>
        <button style={{padding:'6px 14px', borderRadius:7, border:0, background:'var(--ink-900)', color:'#fff', fontSize:12, fontWeight:600, fontFamily:'inherit'}}>現場担当者</button>
        <button style={{padding:'6px 14px', borderRadius:7, border:0, background:'transparent', color:'var(--ink-600)', fontSize:12, fontWeight:600, fontFamily:'inherit'}}>管理者</button>
      </div>
      <h1 style={{margin:'4px 0 12px', fontSize:22, fontWeight:700, letterSpacing:'-.01em'}}>こんにちは、谷さん</h1>
      <form onSubmit={(e)=>{e.preventDefault(); onGo('search');}} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'12px 14px', display:'flex', alignItems:'center', gap:10, boxShadow:'var(--shadow-1)'}}>
        <I.search/>
        <input value={query} onChange={e=>onQuery(e.target.value)} placeholder="検索: VPN、経費..." style={{flex:1, border:0, outline:0, fontSize:13, background:'transparent', fontFamily:'inherit'}}/>
      </form>
    </div>

    <div style={{padding:'14px 18px 24px'}}>
      <div className="label" style={{marginBottom:10}}>続きから</div>
      <div style={{display:'flex', gap:10, overflowX:'auto', margin:'0 -18px', padding:'0 18px 6px'}}>
        {sampleInstructions.slice(0,4).map(it=>(
          <button key={it.id} onClick={()=>onGo('detail')} style={{minWidth:190, background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, overflow:'hidden', textAlign:'left', cursor:'pointer', fontFamily:'inherit', padding:0, flexShrink:0}}>
            <div className="placeholder" style={{height:70, borderRadius:0, border:0, borderBottom:'1px solid var(--ink-200)'}}>img</div>
            <div style={{padding:'10px 12px'}}>
              <CategoryChip raw={it.category} size="sm"/>
              <div style={{fontWeight:700, fontSize:12, marginTop:6, lineHeight:1.4}}>{it.title}</div>
              <div className="tiny muted" style={{marginTop:6, display:'flex', justifyContent:'space-between'}}>
                <span>3 / {it.steps}</span><span style={{fontFamily:'var(--font-mono)'}}>{it.version}</span>
              </div>
              <div style={{height:3, background:'var(--ink-100)', borderRadius:99, marginTop:5, overflow:'hidden'}}>
                <div style={{height:'100%', width:`${(3/it.steps)*100}%`, background:'var(--accent)'}}/>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="label" style={{marginTop:18, marginBottom:10}}>部署で人気</div>
      <div style={{display:'flex', flexDirection:'column', gap:8}}>
        {sampleInstructions.slice(2,6).map(it=>(
          <button key={it.id} onClick={()=>onGo('detail')} style={{display:'flex', alignItems:'center', gap:10, background:'#fff', border:'1px solid var(--ink-200)', borderRadius:10, padding:'10px 12px', textAlign:'left', cursor:'pointer', fontFamily:'inherit'}}>
            <div className="placeholder" style={{width:42, height:42, borderRadius:8, border:0, fontSize:0, flexShrink:0}}/>
            <div style={{flex:1, minWidth:0}}>
              <div style={{fontWeight:700, fontSize:13, lineHeight:1.3, marginBottom:3}}>{it.title}</div>
              <div className="tiny muted" style={{display:'flex', gap:6, alignItems:'center'}}><span>{getCategoryDisplay(it.category).label}</span>·<span style={{fontFamily:'var(--font-mono)'}}>{it.version}</span></div>
            </div>
            <I.chevR/>
          </button>
        ))}
      </div>

      <div className="label" style={{marginTop:18, marginBottom:10}}>クイック</div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        <button onClick={()=>onGo('list')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:10, padding:'12px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontFamily:'inherit'}}>
          <I.search size={18}/><span style={{fontSize:13, fontWeight:600}}>すべて見る</span>
        </button>
        <button onClick={()=>onGo('edit')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:10, padding:'12px', display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontFamily:'inherit'}}>
          <I.plus size={18}/><span style={{fontSize:13, fontWeight:600}}>新規作成</span>
        </button>
      </div>
    </div>
  </>
);

// ============================================================================
// LIST (Mobile)
// ============================================================================
const ListMobile = ({ onGo, query, onQuery }) => (
  <>
    <div style={{padding:'4px 16px 10px', background:'#fff', borderBottom:'1px solid var(--ink-200)'}}>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
        <button onClick={()=>onGo('home')} style={{background:'transparent', border:0, cursor:'pointer', padding:0}}><I.chevL/></button>
        <div style={{fontWeight:700, fontSize:14, flex:1}}>手順書を探す</div>
      </div>
      <form onSubmit={(e)=>{e.preventDefault(); onGo('search');}} style={{display:'flex', alignItems:'center', gap:10, height:40, background:'var(--ink-50)', border:'1px solid var(--ink-200)', borderRadius:10, padding:'0 14px'}}>
        <I.search/>
        <input value={query} onChange={e=>onQuery(e.target.value)} placeholder="検索" style={{flex:1, border:0, outline:0, background:'transparent', fontSize:13, fontFamily:'inherit'}}/>
      </form>
    </div>
    <div style={{padding:'10px 16px', background:'#fff', display:'flex', gap:6, overflowX:'auto'}}>
      {['すべて','事務','情シス','現場','機材'].map((c,i)=>(
        <span key={c} className={i===0?'chip accent':'chip ghost'} style={{flexShrink:0, height:26, padding:'0 11px'}}>{c}</span>
      ))}
    </div>
    <div style={{padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--ink-200)', background:'#fff'}}>
      <div className="tiny muted">124 件 · 更新日 ↓</div>
      <span className="chip ghost"><I.filter size={11}/> 絞り込み</span>
    </div>
    <div style={{padding:'10px 16px 16px', display:'flex', flexDirection:'column', gap:10}}>
      {sampleInstructions.map(it=>(
        <button key={it.id} onClick={()=>onGo('detail')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:10, display:'flex', gap:12, textAlign:'left', cursor:'pointer', fontFamily:'inherit'}}>
          <div className="placeholder" style={{width:60, height:60, borderRadius:8, border:0, flexShrink:0, fontSize:0}}/>
          <div style={{flex:1, minWidth:0}}>
            <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:4}}>
              <CategoryChip raw={it.category} size="sm"/>
              {it.pinned && <I.pin filled size={11}/>}
              <span className="tiny muted" style={{fontFamily:'var(--font-mono)', marginLeft:'auto'}}>{it.version}</span>
            </div>
            <div style={{fontWeight:700, fontSize:13, lineHeight:1.4, marginBottom:4}}>{it.title}</div>
            <div className="tiny muted">{it.author} · {it.updated}</div>
          </div>
        </button>
      ))}
    </div>
  </>
);

// ============================================================================
// SEARCH (Mobile)
// ============================================================================
const SearchMobile = ({ onGo, query, onQuery }) => {
  const q = (query || 'VPN').trim();
  const results = [
    { ...sampleInstructions[2], snippet: '社内 VPN 接続トラブル対応 — Tier1 切り分け手順。SSL-VPN クライアント側の問題か、認証サーバ側の問題かを判別。', match:['title','body'] },
    { ...sampleInstructions[3], snippet: '配属部署のフォルダ権限を付与した後、VPN 用クライアント証明書をインストール。', match:['body'] },
    { id:'MN-2210-005', title:'リモートワーク機器 持出申請', category:'事務作業', author:'小林 颯', dept:'管理部', updated:'2026-02-18', version:'v1.0', snippet:'社外利用時の VPN 接続については別途参照。', match:['body'] },
  ];
  return (
    <>
      <div style={{padding:'4px 16px 10px', background:'#fff', borderBottom:'1px solid var(--ink-200)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <button onClick={()=>onGo('list')} style={{background:'transparent', border:0, cursor:'pointer', padding:0}}><I.chevL/></button>
          <div style={{fontWeight:700, fontSize:14, flex:1}}>検索結果</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:10, height:40, background:'var(--ink-50)', border:'1px solid var(--ink-200)', borderRadius:10, padding:'0 14px'}}>
          <I.search/>
          <input value={query} onChange={e=>onQuery(e.target.value)} style={{flex:1, border:0, outline:0, background:'transparent', fontSize:13, fontWeight:600, fontFamily:'inherit'}}/>
          <button onClick={()=>onQuery('')} style={{background:'transparent', border:0, color:'var(--ink-400)', cursor:'pointer'}}>×</button>
        </div>
      </div>

      <div style={{padding:'12px 16px 4px', display:'flex', alignItems:'baseline', gap:8}}>
        <div style={{fontSize:13, fontWeight:700}}>「<span style={{color:'var(--accent-ink)'}}>{q}</span>」</div>
        <div className="tiny muted">{results.length} 件 · 全 124 件中</div>
      </div>

      <div style={{padding:'4px 16px 10px', display:'flex', gap:6, overflowX:'auto'}}>
        {[['本文 3'],['タイトル 1'],['タグ 1'],['1ヶ月以内 0']].map(([l],i)=>(
          <span key={i} className={i===0?'chip accent':'chip ghost'} style={{flexShrink:0, height:24, padding:'0 10px', fontSize:11}}>{l}</span>
        ))}
      </div>

      <div style={{padding:'4px 16px 16px', display:'flex', flexDirection:'column', gap:10}}>
        {results.map((r, i)=>(
          <button key={r.id} onClick={()=>onGo('detail')} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:12, padding:'12px 14px', textAlign:'left', cursor:'pointer', fontFamily:'inherit'}}>
            <div style={{display:'flex', alignItems:'center', gap:5, marginBottom:6}}>
              <CategoryChip raw={r.category} size="sm"/>
              <span className="tiny muted" style={{fontFamily:'var(--font-mono)'}}>{r.version}</span>
              <span className="tiny muted" style={{marginLeft:'auto'}}>関連度 {[97,82,64][i]}%</span>
            </div>
            <div style={{fontWeight:700, fontSize:14, marginBottom:5, lineHeight:1.4}}><Hi text={r.title} q={q}/></div>
            <div style={{fontSize:12.5, color:'var(--ink-700)', lineHeight:1.6, marginBottom:5}}>…<Hi text={r.snippet} q={q}/>…</div>
            <div className="tiny muted">{r.author} · {r.updated}</div>
          </button>
        ))}

        <div style={{padding:'14px 16px', border:'1px dashed var(--ink-300)', borderRadius:10, fontSize:12, color:'var(--ink-600)', textAlign:'center', marginTop:4}}>
          関連手順がない？<br/>
          <button onClick={()=>onGo('edit')} style={{background:'transparent', border:0, color:'var(--accent-ink)', fontWeight:700, marginTop:6, cursor:'pointer', fontFamily:'inherit'}}>「{q}」で新規作成 →</button>
        </div>
      </div>
    </>
  );
};

// ============================================================================
// DETAIL (Mobile)
// ============================================================================
const DetailMobile = ({ onGo }) => {
  const m = mDetail;
  const [openStep, setOpenStep] = React.useState(2);
  return (
    <>
      <div style={{padding:'4px 16px 12px', background:'#fff', borderBottom:'1px solid var(--ink-200)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
          <button onClick={()=>onGo('list')} style={{background:'transparent', border:0, cursor:'pointer', padding:0}}><I.chevL/></button>
          <div style={{flex:1}}/>
          <button style={{background:'transparent', border:0, cursor:'pointer', padding:6}}><I.star/></button>
          <button style={{background:'transparent', border:0, cursor:'pointer', padding:6}}><I.share/></button>
          <button onClick={()=>onGo('edit')} style={{background:'transparent', border:0, cursor:'pointer', padding:6, color:'var(--accent-ink)', fontWeight:700, fontSize:12, fontFamily:'inherit'}}>編集</button>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
          <CategoryChip raw={m.category} size="sm"/>
          {m.tags.slice(0,2).map(t => <span key={t} className="chip ghost" style={{fontSize:10, height:18}}>#{t}</span>)}
          <span className="tiny muted" style={{marginLeft:'auto', fontFamily:'var(--font-mono)'}}>{m.version}</span>
        </div>
        <h1 style={{margin:'0 0 6px', fontSize:18, fontWeight:700, lineHeight:1.4}}>{m.title}</h1>
        <div className="tiny muted">{m.author} · 更新 {m.updated}</div>
        <div style={{display:'flex', alignItems:'center', gap:8, marginTop:12, padding:'10px 12px', background:'var(--ink-50)', borderRadius:9}}>
          <div style={{fontSize:11, fontWeight:700}}>進捗 2/{m.steps.length}</div>
          <div style={{flex:1, height:5, background:'var(--ink-200)', borderRadius:99, overflow:'hidden'}}>
            <div style={{height:'100%', width:`${(2/m.steps.length)*100}%`, background:'var(--accent)'}}/>
          </div>
        </div>
      </div>
      <div style={{display:'flex', gap:0, background:'#fff', borderBottom:'1px solid var(--ink-200)', overflowX:'auto', padding:'0 16px'}}>
        {[['手順',true],['フロー'],['履歴'],['添付']].map(([label, active])=>(
          <div key={label} style={{padding:'10px 14px', borderBottom: active?'2px solid var(--accent)':'2px solid transparent', color: active?'var(--accent-ink)':'var(--ink-500)', fontSize:13, fontWeight:600, flexShrink:0, marginBottom:-1}}>{label}</div>
        ))}
      </div>
      <div style={{padding:'12px 16px', display:'flex', flexDirection:'column', gap:8}}>
        {m.steps.map((s, i)=>{
          const done = i < 2;
          const open = openStep === i;
          return (
            <div key={i} style={{background:'#fff', border:'1px solid var(--ink-200)', borderRadius:11, overflow:'hidden'}}>
              <button onClick={()=>setOpenStep(open?-1:i)} style={{width:'100%', display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'transparent', border:0, cursor:'pointer', fontFamily:'inherit', textAlign:'left'}}>
                <div style={{width:24, height:24, borderRadius:6, background: done?'var(--accent)':(open?'var(--ink-900)':'var(--ink-100)'), color: done||open?'#fff':'var(--ink-700)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, flexShrink:0}}>
                  {done?<I.check size={12}/>:i+1}
                </div>
                <div style={{flex:1, fontWeight:700, fontSize:13}}>{s.title}</div>
                <I.chevDown size={14} style={{transform: open?'rotate(180deg)':'none', transition:'transform .2s'}}/>
              </button>
              {open && (
                <div style={{padding:'4px 14px 14px 48px', borderTop:'1px solid var(--ink-100)'}}>
                  <div style={{fontSize:13, color:'var(--ink-700)', lineHeight:1.65, paddingTop:10}}>{s.body}</div>
                  {s.caution && (
                    <div style={{background:'var(--warn-soft)', borderRadius:7, padding:'8px 10px', margin:'8px 0', fontSize:12, color:'var(--warn)', borderLeft:'3px solid var(--warn)'}}>
                      <b>注意:</b> {s.caution}
                    </div>
                  )}
                  {s.checks && (
                    <div style={{marginTop:8}}>
                      {s.checks.map((c,j)=>(
                        <label key={j} style={{display:'flex', gap:6, alignItems:'center', fontSize:12, padding:'4px 0'}}>
                          <input type="checkbox" defaultChecked={i===0} style={{accentColor:'var(--accent)'}}/>{c}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

// ============================================================================
// EDIT (Mobile)
// ============================================================================
const EditMobile = ({ onGo }) => {
  const m = mDetail;
  return (
    <>
      <div style={{padding:'4px 14px 10px', background:'#fff', borderBottom:'1px solid var(--ink-200)'}}>
        <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
          <button onClick={()=>onGo('detail')} style={{background:'transparent', border:0, cursor:'pointer', padding:0}}><I.chevL/></button>
          <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:11, color:'var(--ok)'}}>
            <span className="dot" style={{background:'var(--ok)'}}/>保存済
          </span>
          <div style={{flex:1}}/>
          <button className="btn ghost" style={{height:30, fontSize:12}}>プレビュー</button>
          <button onClick={()=>onGo('detail')} className="btn primary" style={{height:30, fontSize:12}}>公開</button>
        </div>
        <input defaultValue={m.title} style={{width:'100%', border:0, outline:0, fontSize:18, fontWeight:700, padding:'4px 0', fontFamily:'var(--font-display)', background:'transparent'}}/>
        <div style={{display:'flex', gap:5, marginTop:4, alignItems:'center'}}>
          <CategoryChip raw={m.category} size="sm"/>
          <span className="chip ghost" style={{fontSize:10}}>{m.version} → v3.2</span>
        </div>
      </div>

      <div style={{padding:'10px 14px', background:'var(--ink-50)', borderBottom:'1px solid var(--ink-200)', display:'flex', gap:6, alignItems:'center', overflowX:'auto'}}>
        {m.steps.map((s,i)=>(
          <div key={i} style={{padding:'6px 10px', background: i===2?'var(--accent)':'#fff', color: i===2?'#fff':'var(--ink-700)', border:'1px solid '+(i===2?'var(--accent)':'var(--ink-200)'), borderRadius:7, fontSize:11, fontWeight:600, flexShrink:0, fontFamily:'var(--font-mono)'}}>{String(i+1).padStart(2,'0')}</div>
        ))}
        <button className="btn ghost" style={{height:30, fontSize:11, flexShrink:0}}><I.plus size={12}/></button>
      </div>

      <div style={{padding:'14px', overflow:'auto'}}>
        <div className="label" style={{marginBottom:5}}>ステップ 03</div>
        <input defaultValue={m.steps[2].title} style={{width:'100%', border:0, outline:0, fontSize:18, fontWeight:700, padding:'4px 0', borderBottom:'1px dashed var(--ink-300)', marginBottom:12, fontFamily:'inherit', background:'transparent'}}/>
        <textarea defaultValue={m.steps[2].body} style={{width:'100%', minHeight:90, border:'1px solid var(--ink-200)', borderRadius:8, padding:'10px 12px', fontSize:13, lineHeight:1.6, fontFamily:'inherit', background:'#fff'}}/>
        <div style={{background:'var(--warn-soft)', borderLeft:'3px solid var(--warn)', borderRadius:7, padding:'8px 12px', marginTop:10, fontSize:12, color:'var(--warn)'}}>
          <b>注意:</b> {m.steps[2].caution}
        </div>
        <div style={{display:'flex', gap:6, marginTop:12, overflowX:'auto', paddingBottom:4}}>
          {[['見出し', <I.doc size={13}/>],['注意', <I.warn size={13}/>],['チェック', <I.check size={13}/>],['画像', <I.image size={13}/>],['リンク', <I.link size={13}/>]].map(([l, ic])=>(
            <span key={l} className="chip ghost" style={{flexShrink:0, height:30, padding:'0 10px'}}>{ic} {l}</span>
          ))}
        </div>
      </div>
    </>
  );
};

window.bMobile = { HomeMobile, ListMobile, SearchMobile, DetailMobile, EditMobile };
