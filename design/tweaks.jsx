// Tweaks — B案用のカラー / 文字サイズ / ダークモード

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "default",
  "fontScale": 100,
  "dark": false
}/*EDITMODE-END*/;

const palettes = {
  'default': { a:'#0EA37D', as:'#E0F4EE', ai:'#086150' },  // 既定 — モダンティール
  'cool':    { a:'#2F5BFF', as:'#E8EDFF', ai:'#0A2EB8' },  // 信頼ブルー
  'warm':    { a:'#D97757', as:'#FBEAE2', ai:'#7C3A20' },  // ウォーム朱
  'mono':    { a:'#0B1B2B', as:'#E5E7EB', ai:'#0B1B2B' },  // モノクロ
};

const ManualSystemTweaks = () => {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const p = palettes[t.palette] || palettes.default;
    document.querySelectorAll('.pat-b').forEach(el => {
      el.style.setProperty('--accent',      p.a);
      el.style.setProperty('--accent-soft', p.as);
      el.style.setProperty('--accent-ink',  p.ai);
    });

    document.querySelectorAll('.frame').forEach(el => {
      el.style.fontSize = (t.fontScale / 100 * 14) + 'px';
    });

    if (t.dark) {
      document.querySelectorAll('.frame').forEach(el => {
        el.style.setProperty('--bg', '#0E1620');
        el.style.setProperty('--surface', '#16202E');
        el.style.setProperty('--ink-900', '#F1F5F9');
        el.style.setProperty('--ink-800', '#E2E8F0');
        el.style.setProperty('--ink-700', '#CBD5E1');
        el.style.setProperty('--ink-600', '#94A3B8');
        el.style.setProperty('--ink-500', '#94A3B8');
        el.style.setProperty('--ink-400', '#64748B');
        el.style.setProperty('--ink-300', '#475569');
        el.style.setProperty('--ink-200', '#334155');
        el.style.setProperty('--ink-100', '#1E293B');
        el.style.setProperty('--ink-50',  '#1E293B');
      });
    } else {
      document.querySelectorAll('.frame').forEach(el => {
        ['--bg','--surface','--ink-900','--ink-800','--ink-700','--ink-600','--ink-500','--ink-400','--ink-300','--ink-200','--ink-100','--ink-50'].forEach(v => el.style.removeProperty(v));
      });
    }
  }, [t.palette, t.fontScale, t.dark]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="アクセント色">
        <TweakRadio
          label="パレット"
          value={t.palette}
          options={['default','cool','warm','mono']}
          onChange={v=>setTweak('palette', v)}
        />
      </TweakSection>
      <TweakSection label="表示">
        <TweakToggle label="ダークモード" value={t.dark} onChange={v=>setTweak('dark', v)}/>
        <TweakSlider label="文字サイズ" min={85} max={130} step={5} unit="%" value={t.fontScale} onChange={v=>setTweak('fontScale', v)}/>
      </TweakSection>
    </TweaksPanel>
  );
};

window.ManualSystemTweaks = ManualSystemTweaks;
