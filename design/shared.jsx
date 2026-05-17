// Shared frame components + sample data
// Loaded before all the pattern frames.

const sampleInstructions = [
  { id: 'MN-2410-001', title: '受発注書類の Drive 取込フロー',     category: '事務作業',     author: '田中 美咲', dept: '営業企画部',   updated: '2026-05-12', version: 'v2.4', steps: 8,  pinned: true,  views: 421, tags: ['受発注','月次','Drive'] },
  { id: 'MN-2410-014', title: '月次経費精算 / 領収書チェック',     category: '事務作業',     author: '佐藤 健一', dept: '経理課',       updated: '2026-05-08', version: 'v1.2', steps: 12, pinned: false, views: 318, tags: ['経費','月次'] },
  { id: 'MN-2407-003', title: '社内VPN接続トラブル対応',           category: '情報システム', author: '山田 涼',   dept: '情シス',       updated: '2026-04-30', version: 'v3.1', steps: 6,  pinned: false, views: 612, tags: ['VPN','障害','Tier1'] },
  { id: 'MN-2403-021', title: '新入社員アカウント発行',             category: '情報システム', author: '山田 涼',   dept: '情シス',       updated: '2026-04-22', version: 'v5.0', steps: 9,  pinned: true,  views: 287, tags: ['オンボード','権限'] },
  { id: 'MN-2401-007', title: '会議室予約システム 操作ガイド',       category: 'pc_work',     author: '中村 葉子', dept: '総務',         updated: '2026-04-15', version: 'v2.0', steps: 4,  pinned: false, views: 901, tags: ['総務','日常'] },
  { id: 'MN-2312-019', title: 'プロジェクター・モニター接続',       category: '現場作業',     author: '中村 葉子', dept: '総務',         updated: '2026-03-28', version: 'v1.4', steps: 5,  pinned: false, views: 233, tags: ['会議室','機材'] },
  { id: 'MN-2311-002', title: '入退室カード再発行手順',             category: '事務作業',     author: '中村 葉子', dept: '総務',         updated: '2026-03-15', version: 'v1.1', steps: 6,  pinned: false, views: 154, tags: ['総務'] },
  { id: 'MN-2310-024', title: '社用車 利用前点検チェック',           category: '現場作業',     author: '小林 颯',   dept: '管理部',       updated: '2026-03-02', version: 'v2.2', steps: 11, pinned: false, views: 87,  tags: ['安全','点検'] },
  { id: 'MN-2502-008', title: '顧客請求書 月次発送手順',             category: '営業事務',     author: '高橋 真奈', dept: '営業企画部',   updated: '2026-05-14', version: 'v1.0', steps: 7,  pinned: false, views: 22,  tags: ['請求','月次'] },
  { id: 'MN-2502-011', title: '取引先マスタ更新',                   category: 'customer_master', author: '高橋 真奈', dept: '営業企画部', updated: '2026-05-09', version: 'v1.1', steps: 5,  pinned: false, views: 18,  tags: ['マスタ','取引先'] },
];

// — カテゴリ・レジストリ ————————————————————————————————————————————————
// C案: ホワイトリスト + alias を基準にしつつ、未登録カテゴリは "未承認" として
// 黄色マーク付きで表示。管理者が承認 or 統合できる。

const officialCategories = [
  { id: '事務作業',     label: '事務作業',     color: '#7DD3FC', desc: '経費・受発注・社内事務' },
  { id: '情報システム', label: '情報システム', color: '#A78BFA', desc: 'IT サポート / インフラ' },
  { id: '現場作業',     label: '現場作業',     color: '#FB923C', desc: '設備・機材・安全' },
];

// 古い ID やゆれを正式値にマップ
const categoryAliases = {
  'pc_work': '事務作業',
  'packing': '現場作業',
  'PC事務作業': '事務作業',
  '梱包作業':   '現場作業',
};

// 公式カテゴリの canonical 値（id）にマップする。alias を解決。
// 該当なしなら null。
function resolveCategory(raw) {
  if (!raw) return null;
  if (officialCategories.find(c => c.id === raw)) return raw;
  if (categoryAliases[raw]) return categoryAliases[raw];
  return null;
}

// 表示用ラベル（公式 or 原文 + 未承認マーク）
function getCategoryDisplay(raw) {
  const resolved = resolveCategory(raw);
  if (resolved) return { label: resolved, official: true, color: officialCategories.find(c=>c.id===resolved).color };
  return { label: raw || '(未分類)', official: false, color: '#EAB308' };
}

// インスタンス群から、未承認カテゴリの一覧と件数を取得
function getPendingCategories(items) {
  const map = {};
  items.forEach(it => {
    if (!resolveCategory(it.category)) {
      const k = it.category || '(未分類)';
      map[k] = (map[k] || 0) + 1;
    }
  });
  return Object.entries(map).map(([id, count]) => ({ id, count }));
}

// 公式カテゴリの件数取得（alias 含む）
function getOfficialCounts(items) {
  return officialCategories.map(c => ({
    ...c,
    count: items.filter(it => resolveCategory(it.category) === c.id).length,
  }));
}

const sampleSteps = [
  {
    title: '受発注フォルダを開く',
    body: 'Google ドライブの「2026 受発注」フォルダを開きます。ブックマークしておくと便利です。',
    caution: 'ショートカット経由ではなく、必ず実フォルダにアクセスしてください。',
    checks: ['ドライブにサインインしている', '2026年フォルダにいる'],
  },
  {
    title: '本日分の PDF を一括選択',
    body: '当日付の PDF を Shift+クリック で複数選択 →「ダウンロード」を実行。',
    checks: ['日付が当日になっている', 'ZIP がローカルに保存された'],
  },
  {
    title: '基幹システムにログイン',
    body: '社内ポータルから「受発注管理」を起動。VPN接続済みであることを確認します。',
    caution: 'VPN未接続の場合、シングルサインオンに失敗します。',
  },
  {
    title: '取込メニューから「一括取込」',
    body: '画面右上の「取込」→「一括取込」を選択し、ダウンロードした ZIP を投入。',
    caution: '取込前に当日バックアップが自動取得されていることを確認。',
    checks: ['差分件数が想定範囲内', 'エラー行ゼロ'],
  },
  {
    title: '取込結果 CSV を保存',
    body: '完了画面の CSV をダウンロードし、当日の処理記録フォルダへ保存。',
  },
  {
    title: '営業企画チャンネルに完了報告',
    body: 'Slack #ops-orders に「○月○日 取込完了 / 件数 X」を投稿します。',
  },
];

// — Frames ————————————————————————————————————————————————

const BrowserFrame = ({ url, children, className = '' }) => (
  <div className={`bezel-pc ${className}`}>
    <div className="pc-bar">
      <div className="pc-lights">
        <div className="pc-light" style={{background:'#EE6A5F'}} />
        <div className="pc-light" style={{background:'#F4BE4F'}} />
        <div className="pc-light" style={{background:'#61C454'}} />
      </div>
      <div className="pc-url">{url}</div>
    </div>
    <div className="pc-screen frame">{children}</div>
  </div>
);

const PhoneFrame = ({ time = '9:41', children, className = '' }) => (
  <div className={`bezel-phone ${className}`}>
    <div className="phone-screen frame">
      <div className="phone-notch" />
      <div className="phone-status">
        <span>{time}</span>
        <span className="right">
          <Signal /> <Wifi /> <Battery />
        </span>
      </div>
      {children}
    </div>
  </div>
);

const Signal = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><rect x="0" y="7" width="2" height="3" rx="0.5"/><rect x="3.5" y="5" width="2" height="5" rx="0.5"/><rect x="7" y="2.5" width="2" height="7.5" rx="0.5"/><rect x="10.5" y="0" width="2" height="10" rx="0.5"/></svg>
);
const Wifi = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M7 9.5l1.5-1.5a2.1 2.1 0 00-3 0L7 9.5zm-3.5-3.5l1.4 1.4a4.4 4.4 0 016.2 0L12.5 6a6.4 6.4 0 00-9 0zM0 2.5l1.4 1.4a8.5 8.5 0 0111.2 0L14 2.5a10.5 10.5 0 00-14 0z"/></svg>
);
const Battery = () => (
  <svg width="22" height="10" viewBox="0 0 22 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor"/><rect x="2" y="2" width="15" height="6" rx="1" fill="currentColor"/><rect x="19.5" y="3" width="1.5" height="4" rx="0.5" fill="currentColor"/></svg>
);

// — Icons ————————————————————————————————————————————————

const I = {
  search:   p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>,
  plus:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  edit:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.8 2.8 0 014 4L7.5 20.5 2 22l1.5-5.5z"/></svg>,
  trash:    p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  filter:   p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>,
  sort:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h13M3 12h9M3 18h5M17 8v11M17 19l4-4M17 19l-4-4"/></svg>,
  bell:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a2 2 0 003.4 0"/></svg>,
  user:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></svg>,
  home:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>,
  doc:      p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>,
  star:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill={p.filled?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 6 6.3.6-4.8 4.2 1.4 6.3L12 17l-5.6 3 1.4-6.3L3 9.6 9.3 9z"/></svg>,
  qr:       p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3M14 18h0M17 18v3M21 14v0M21 18h-3M21 21v-3"/></svg>,
  check:    p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4.5 4.5L20 6"/></svg>,
  chevR:    p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>,
  chevL:    p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>,
  chevDown: p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>,
  more:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
  warn:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.5L2 18.5A2 2 0 003.7 21.5h16.6a2 2 0 001.7-3L13.7 3.5a2 2 0 00-3.4 0z"/><path d="M12 9v5M12 17.5v.2"/></svg>,
  pin:      p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill={p.filled?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5M9 3h6l-1 6 4 3v2H6v-2l4-3z"/></svg>,
  folder:   p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
  download: p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M6 11l6 6 6-6M5 21h14"/></svg>,
  share:    p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>,
  print:    p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z"/></svg>,
  list:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  grid:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>,
  drag:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>,
  image:    p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>,
  attach:   p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12l-9 9a5 5 0 01-7-7L13 6a3.5 3.5 0 015 5l-8 8a2 2 0 11-3-3l7-7"/></svg>,
  link:     p => <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1"/></svg>,
};

// — 共通: カテゴリ chip コンポーネント ——————————————————————————————
const CategoryChip = ({ raw, size = 'md' }) => {
  const { label, official, color } = getCategoryDisplay(raw);
  const styles = {
    sm: { fontSize: 10, height: 18, padding: '0 8px' },
    md: { fontSize: 11, height: 22, padding: '0 8px' },
    lg: { fontSize: 12, height: 26, padding: '0 10px' },
  }[size];
  if (official) {
    return (
      <span style={{
        display:'inline-flex', alignItems:'center', gap:5,
        ...styles, borderRadius: 999, fontWeight: 600,
        background:'var(--accent-soft)', color:'var(--accent-ink)',
      }}>
        <span style={{width:6, height:6, borderRadius:'50%', background: color, flexShrink:0}}/>
        {label}
      </span>
    );
  }
  return (
    <span title="未承認カテゴリ — 管理者が公式カテゴリに分類するまで仮表示" style={{
      display:'inline-flex', alignItems:'center', gap:4,
      ...styles, borderRadius: 999, fontWeight: 600,
      background:'#FEF9C3', color:'#92400E',
      border:'1px dashed #EAB308',
    }}>
      <I.warn size={size==='sm'?9:10}/>
      {label}
    </span>
  );
};

window.shared = { sampleInstructions, sampleSteps, BrowserFrame, PhoneFrame, I,
  officialCategories, categoryAliases, resolveCategory, getCategoryDisplay,
  getPendingCategories, getOfficialCounts, CategoryChip };
