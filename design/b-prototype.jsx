// B案 — クリッカブル プロトタイプ ルーター
// 各プロトタイプは内部状態を持ち、ホーム→一覧→検索→詳細→編集 を遷移可能。

const { BrowserFrame, PhoneFrame } = window.shared;
const { ShellPC, ShellMobile } = window.bShared;
const { HomePC, ListPC, SearchPC, DetailPC, EditPC, AdminCategoriesPC } = window.bPC;
const { HomeMobile, ListMobile, SearchMobile, DetailMobile, EditMobile } = window.bMobile;

const BPrototypePC = ({ initial = 'home' }) => {
  const [route, setRoute] = React.useState(initial);
  const [query, setQuery] = React.useState('VPN');
  const onGo = (r) => setRoute(r);

  let content;
  if (route === 'home')       content = <HomePC   onGo={onGo} query={query} onQuery={setQuery}/>;
  else if (route === 'list')  content = <ListPC   onGo={onGo} query={query} onQuery={setQuery}/>;
  else if (route === 'search')content = <SearchPC onGo={onGo} query={query} onQuery={setQuery}/>;
  else if (route === 'detail')content = <DetailPC onGo={onGo}/>;
  else if (route === 'edit')  content = <EditPC   onGo={onGo}/>;
  else if (route === 'admin-categories') content = <AdminCategoriesPC onGo={onGo}/>;
  else                        content = <HomePC   onGo={onGo} query={query} onQuery={setQuery}/>;

  const urlMap = { home:'/', list:'/manuals', search:`/search?q=${encodeURIComponent(query)}`, detail:'/m/MN-2407-003', edit:'/m/MN-2407-003/edit', 'admin-categories':'/admin/categories' };

  return (
    <BrowserFrame url={`mms.horizon-jit.example${urlMap[route] || '/'}`} className="pat-b">
      <ShellPC route={route} onGo={onGo} query={query} onQuery={setQuery}>{content}</ShellPC>
    </BrowserFrame>
  );
};

const BPrototypeMobile = ({ initial = 'home' }) => {
  const [route, setRoute] = React.useState(initial);
  const [query, setQuery] = React.useState('VPN');
  const onGo = (r) => setRoute(r);
  const hideNav = route === 'edit' || route === 'detail';

  let content;
  if (route === 'home')       content = <HomeMobile   onGo={onGo} query={query} onQuery={setQuery}/>;
  else if (route === 'list')  content = <ListMobile   onGo={onGo} query={query} onQuery={setQuery}/>;
  else if (route === 'search')content = <SearchMobile onGo={onGo} query={query} onQuery={setQuery}/>;
  else if (route === 'detail')content = <DetailMobile onGo={onGo}/>;
  else if (route === 'edit')  content = <EditMobile   onGo={onGo}/>;
  else                        content = <HomeMobile   onGo={onGo} query={query} onQuery={setQuery}/>;

  return (
    <PhoneFrame className="pat-b">
      <ShellMobile route={route} onGo={onGo} query={query} onQuery={setQuery} hideNav={hideNav}>{content}</ShellMobile>
    </PhoneFrame>
  );
};

window.bPrototype = { BPrototypePC, BPrototypeMobile };
