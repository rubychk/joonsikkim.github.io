// Tweaks app — picks palette/mode/fonts/research-layout.
// Persists via localStorage (cross-page) AND postMessage (so file edits stick).

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cream-bronze",
  "mode": "light",
  "fonts": "source",
  "research": "default"
}/*EDITMODE-END*/;

const STORAGE_KEYS = {
  palette: "jk.palette",
  mode: "jk.mode",
  fonts: "jk.fonts",
  research: "jk.research"
};

function readInitial() {
  const out = { ...TWEAK_DEFAULTS };
  try {
    for (const k of Object.keys(STORAGE_KEYS)) {
      const v = localStorage.getItem(STORAGE_KEYS[k]);
      if (v != null) out[k] = v;
    }
  } catch (e) {}
  return out;
}

function applyToRoot(t) {
  const r = document.documentElement;
  // palette
  if (t.palette === "cream-bronze") r.removeAttribute("data-palette");
  else r.setAttribute("data-palette", t.palette);
  // mode
  if (t.mode === "dark") r.setAttribute("data-mode", "dark");
  else r.removeAttribute("data-mode");
  // fonts
  if (t.fonts === "source") r.removeAttribute("data-fonts");
  else r.setAttribute("data-fonts", t.fonts);
  // research
  r.setAttribute("data-research", t.research || "default");
}

function App() {
  const [t, setT] = React.useState(readInitial);

  React.useEffect(() => { applyToRoot(t); }, [t]);

  const setTweak = (keyOrEdits, val) => {
    const edits = (typeof keyOrEdits === "object")
      ? keyOrEdits : { [keyOrEdits]: val };
    setT(prev => ({ ...prev, ...edits }));
    try {
      for (const k of Object.keys(edits)) {
        if (STORAGE_KEYS[k]) localStorage.setItem(STORAGE_KEYS[k], edits[k]);
      }
    } catch (e) {}
    // also tell host so file persists
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits }, '*'); } catch (e) {}
  };

  const onResearchPage = typeof location !== "undefined" && /research\.html?$/i.test(location.pathname);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette" />
      {(() => {
        const palettes = [
          { key: "cream-bronze",     colors: ["#fafaf7", "#1a1a1a", "#7a6a4f"] },
          { key: "ivory-crimson",    colors: ["#ffffff", "#0e0e0e", "#8b2c2c"] },
          { key: "parchment-forest", colors: ["#f5f3ee", "#1f1f1f", "#3a5a40"] },
          { key: "oxford-blue",      colors: ["#fafaf7", "#14171f", "#1e3a66"] },
          { key: "slate-mono",       colors: ["#f7f7f5", "#14140f", "#46464a"] },
          { key: "terracotta",       colors: ["#fbf7f1", "#1c1610", "#b15a3a"] },
          { key: "plum",             colors: ["#faf7f7", "#1a1417", "#5a2e55"] }
        ];
        const current = palettes.find(p => p.key === t.palette) || palettes[0];
        const lookup = {};
        palettes.forEach(p => { lookup[p.colors.join(",").toLowerCase()] = p.key; });
        return (
          <TweakColor
            label="Theme"
            value={current.colors}
            options={palettes.map(p => p.colors)}
            onChange={(colors) => {
              const key = colors.join(",").toLowerCase();
              setTweak("palette", lookup[key] || "cream-bronze");
            }}
          />
        );
      })()}
      <TweakToggle
        label="Dark mode"
        value={t.mode === "dark"}
        onChange={(v) => setTweak("mode", v ? "dark" : "light")}
      />

      <TweakSection label="Typography" />
      <TweakRadio
        label="Font family"
        value={t.fonts}
        options={[
          { value: "source",   label: "Source" },
          { value: "garamond", label: "Garamond" },
          { value: "plex",     label: "Plex" }
        ]}
        onChange={(v) => setTweak("fonts", v)}
      />

      {onResearchPage && (
        <React.Fragment>
          <TweakSection label="Research layout" />
          <TweakRadio
            label="Style"
            value={t.research}
            options={[
              { value: "default",  label: "List" },
              { value: "numbered", label: "Numbered" },
              { value: "cards",    label: "Cards" }
            ]}
            onChange={(v) => setTweak("research", v)}
          />
        </React.Fragment>
      )}
    </TweaksPanel>
  );
}

// Apply theme immediately (before React mounts) so there's no flash
applyToRoot(readInitial());

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
