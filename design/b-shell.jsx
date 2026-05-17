// B案クリックプロトタイプ — 共有 UI（PC・Mobile 両方で使用）
// シェル(サイドナビ・トップバー)と画面切替ルーター。

const { sampleInstructions, sampleSteps, BrowserFrame, PhoneFrame, I,
  officialCategories, getOfficialCounts, getPendingCategories } = window.shared;

// ============================================================================
// PC SHELL — サイドナビ + ヘッダー
// ============================================================================
const ShellPC = ({ route, onGo, query, onQuery, children }) => (
  <div style={{display:'flex', height:'100%', background:'#FAFAF6'}}>
    {/* Sidebar */}
    <aside style={{width:228, background:'var(--ink-900)', color:'rgba(255,255,255,.86)', display:'flex', flexDirection:'column'}}>
      <div style={{padding:'18px 18px 16px', display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:30, height:30, borderRadius:7, background:'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontFamily:'var(--font-display)', fontSize:14}}>M</div>
        <div>
          <div style={{fontWeight:700, fontSize:13, letterSpacing:'.02em'}}>手順書管理</div>
          <div style={{fontSize:10, color:'rgba(255,255,255,.45)', fontFamily:'var(--font-mono)'}}>HORIZON-JIT</div>
        </div>
      </div>
      <nav style={{padding:'8px 10px', display:'flex', flexDirection:'column', gap:2, fontSize:13}}>
        {[
          ['home','ホーム',<I.home/>],
          ['list','手順書を探す',<I.search/>],
          ['pinned','ピン留め',<I.pin/>],
          ['drafts','下書き',<I.edit/>],
          ['history','閲覧履歴',<I.doc/>],
        ].map(([k, label, icon])=>{
          const active = route === k || (k==='list' && route==='search') || (k==='list' && route==='detail') || (k==='list' && route==='edit');
          return (
            <button key={k} onClick={()=>onGo(k==='list'?'list':k)} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:7, background: active?'rgba(255,255,255,.10)':'transparent', color: active?'#fff':'rgba(255,255,255,.7)', border:0, cursor:'pointer', fontFamily:'inherit', fontSize:'inherit', textAlign:'left', width:'100%'}}>
              {icon}<span>{label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{padding:'8px 18px', fontSize:10, fontWeight:700, letterSpacing:'.1em', color:'rgba(255,255,255,.45)', marginTop:14}}>カテゴリ</div>
      <div style={{padding:'0 10px'}}>
        {getOfficialCounts(sampleInstructions).map(c => (
          <button key={c.id} onClick={()=>onGo('list')} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 10px', fontSize:12.5, color:'rgba(255,255,255,.7)', background:'transparent', border:0, cursor:'pointer', fontFamily:'inherit', width:'100%', textAlign:'left'}}>
            <span style={{width:7, height:7, borderRadius:'50%', background: c.color, flexShrink:0}}/>
            <span style={{flex:1}}>{c.label}</span>
            <span style={{fontFamily:'var(--font-mono)', fontSize:10, color:'rgba(255,255,255,.4)'}}>{c.count}</span>
          </button>
        ))}
        {(() => {
          const pending = getPendingCategories(sampleInstructions);
          if (pending.length === 0) return null;
          const total = pending.reduce((s, p) => s + p.count, 0);
          return (
            <button onClick={()=>onGo('admin-categories')} style={{display:'flex', alignItems:'center', gap:10, padding:'7px 10px', marginTop:4, fontSize:12.5, color:'#FDE68A', background:'rgba(234,179,8,0.10)', border:'1px solid rgba(234,179,8,0.25)', borderRadius:7, cursor:'pointer', fontFamily:'inherit', width:'100%', textAlign:'left'}}>
              <I.warn size={12}/>
              <span style={{flex:1}}>未承認カテゴリ</span>
              <span style={{fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700}}>{pending.length}</span>
            </button>
          );
        })()}
      </div>
      <div style={{marginTop:'auto', padding:14, borderTop:'1px solid rgba(255,255,255,.08)', display:'flex', alignItems:'center', gap:10}}>
        <div style={{width:28, height:28, borderRadius:'50%', background:'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:11}}>YT</div>
        <div style={{flex:1, minWidth:0}}>
          <div style={{fontSize:12, fontWeight:600, color:'#fff'}}>谷 友真</div>
          <div style={{fontSize:10, color:'rgba(255,255,255,.5)'}}>情シス</div>
        </div>
        <I.bell />
      </div>
    </aside>

    {/* Main */}
    <main style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden'}}>
      {/* Top search bar (shows except home which has hero search) */}
      {route !== 'home' && (
        <header style={{display:'flex', alignItems:'center', gap:12, padding:'12px 28px', borderBottom:'1px solid var(--ink-200)', background:'#fff'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--ink-500)'}}>
            <button onClick={()=>onGo('home')} style={{background:'transparent', border:0, color:'inherit', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:4, padding:0}}><I.home size={13}/></button>
            {route !== 'list' && <><I.chevR size={11}/><button onClick={()=>onGo('list')} style={{background:'transparent', border:0, color:'inherit', cursor:'pointer', fontFamily:'inherit', padding:0}}>手順書を探す</button></>}
            {route === 'search' && <><I.chevR size={11}/><span style={{color:'var(--ink-900)', fontWeight:600}}>検索結果</span></>}
            {route === 'detail' && <><I.chevR size={11}/><span style={{color:'var(--ink-900)', fontWeight:600}}>受発注書類の Drive 取込フロー</span></>}
            {route === 'edit'   && <><I.chevR size={11}/><span style={{color:'var(--ink-900)', fontWeight:600}}>編集中</span></>}
            {route === 'admin-categories' && <><I.chevR size={11}/><span style={{color:'var(--warn)', fontWeight:600}}><I.warn size={11} style={{verticalAlign:'-2px'}}/> カテゴリ承認キュー</span></>}
          </div>
          <form onSubmit={(e)=>{ e.preventDefault(); onGo('search'); }} style={{flex:1, maxWidth:560, marginLeft:'auto', display:'flex', alignItems:'center', gap:10, height:36, background:'var(--ink-50)', borderRadius:9, padding:'0 14px', border:'1px solid var(--ink-200)'}}>
            <I.search />
            <input value={query} onChange={e=>onQuery(e.target.value)} placeholder="タイトル・本文・タグで検索"
              style={{flex:1, border:0, outline:0, background:'transparent', fontSize:13, fontFamily:'inherit'}}/>
            <span className="chip ghost" style={{fontFamily:'var(--font-mono)', fontSize:10}}>⌘ K</span>
          </form>
          <button onClick={()=>onGo('edit')} className="btn primary"><I.plus size={14}/> 作成</button>
        </header>
      )}
      <div style={{flex:1, overflow:'auto'}}>{children}</div>
    </main>
  </div>
);

// ============================================================================
// MOBILE SHELL
// ============================================================================
const ShellMobile = ({ route, onGo, query, onQuery, hideNav, children }) => (
  <div style={{height:'100%', display:'flex', flexDirection:'column', background:'#FAFAF6'}}>
    <div style={{flex:1, overflow:'auto', paddingBottom: hideNav ? 0 : 60}}>{children}</div>
    {!hideNav && (
      <nav style={{position:'absolute', left:0, right:0, bottom:0, height:60, background:'#fff', borderTop:'1px solid var(--ink-200)', display:'flex'}}>
        {[
          ['home','ホーム',<I.home/>],
          ['list','探す',<I.search/>],
          ['create','作成',<I.plus/>],
          ['pinned','ピン',<I.pin/>],
          ['user','設定',<I.user/>],
        ].map(([k, label, icon])=>{
          const active = route === k || (k==='list' && (route==='search'||route==='detail')) || (k==='create' && route==='edit');
          return (
            <button key={k} onClick={()=>onGo(k==='create'?'edit':k)} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, color: active?'var(--accent)':'var(--ink-500)', background:'transparent', border:0, cursor:'pointer', fontFamily:'inherit'}}>
              {k==='create' ? (
                <div style={{width:36, height:36, borderRadius:'50%', background:'var(--accent)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', marginTop:-14, boxShadow:'0 4px 12px rgba(14,163,125,.35)'}}>{icon}</div>
              ) : icon}
              <span style={{fontSize:10, fontWeight:600}}>{label}</span>
            </button>
          );
        })}
      </nav>
    )}
  </div>
);

window.bShared = { ShellPC, ShellMobile };
