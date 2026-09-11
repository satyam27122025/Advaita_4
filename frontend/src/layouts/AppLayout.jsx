import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";

import { useLenis } from "../hooks/useLenis";
import { pages } from "../utils/constants";
import { cn } from "../utils/cn";
import { getApiBase } from "../utils/api";
import { BackendConfigModal } from "../components/BackendConfigModal";

export function AppLayout({ children }) {
  useLenis();
  const [showConfig, setShowConfig] = useState(false);
  const [activeApi, setActiveApi] = useState(getApiBase());

  useEffect(() => {
    const handleUrlChange = () => setActiveApi(getApiBase());
    window.addEventListener("cerebro_api_url_changed", handleUrlChange);
    return () => window.removeEventListener("cerebro_api_url_changed", handleUrlChange);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(120,0,20,0.22),_transparent_32%),linear-gradient(180deg,#050505_0%,#080808_100%)]">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-4 md:px-8 md:py-6">
        <header className="crt-panel rounded-[28px] border border-[#ff0033]/30 bg-black/60 px-5 py-4 md:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <Link to="/" className="max-w-xl">
              <p className="pixel-copy text-[10px] text-red-300">HAWKINS LAB // CEREBRO UPLINK</p>
              <p className="mt-2 text-xl font-black uppercase tracking-[0.28em] text-white md:text-2xl">Cerebro Code Red Synchronizer</p>
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfig(true)}
                title="Configure Backend Uplink URL"
                className="inline-flex items-center gap-2 rounded-full border border-[#00ff66]/30 bg-black/40 px-3 py-1.5 font-vt323 text-base uppercase tracking-wider text-[#00ff66] transition hover:border-[#00ff66] hover:bg-[#00ff66]/10"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ff66]" />
                <span>UPLINK: {activeApi.replace(/^https?:\/\//, "")}</span>
                <span className="text-white/40">⚙</span>
              </button>

              <nav className="flex flex-wrap gap-2">
                {pages.map(([label, path]) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      cn(
                        "rounded-full border px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-slate-300 transition",
                        isActive ? "border-red-500/50 bg-red-500/10 text-red-100" : "border-white/10 hover:border-[#00ff66]/40 hover:text-[#9dffbf]",
                      )
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </header>
        <main className="relative z-10 flex-1 py-6">{children}</main>
      </div>

      <BackendConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />
    </div>
  );
}
