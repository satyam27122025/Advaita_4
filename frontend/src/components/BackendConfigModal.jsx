import React, { useState, useEffect } from "react";
import { getApiBase, setCustomApiBase, api } from "../utils/api";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function BackendConfigModal({ isOpen, onClose }) {
  const [url, setUrl] = useState("");
  const [testStatus, setTestStatus] = useState(null); // 'idle', 'testing', 'success', 'error'
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUrl(getApiBase());
      setTestStatus("idle");
      setStatusMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus("testing");
    setStatusMessage("Pinging uplink server...");
    const targetUrl = url.trim().replace(/\/$/, "");
    const startTime = Date.now();

    try {
      const res = await api.healthCheck(targetUrl);
      const latency = Date.now() - startTime;
      setTestStatus("success");
      setStatusMessage(`UPLINK CONNECTED (${latency}ms) - Status: ${res.status || "OK"}`);
    } catch (err) {
      setTestStatus("error");
      setStatusMessage(
        err.message ||
          "Failed to reach server. Note: On HTTPS (Vercel), you must use an https:// backend URL."
      );
    }
  };

  const handleSave = () => {
    setCustomApiBase(url.trim());
    window.location.reload();
  };

  const handleReset = () => {
    setCustomApiBase("");
    setUrl((import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, ""));
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#ff0033]/60 bg-[#0a0a0a] p-6 shadow-[0_0_50px_rgba(255,0,51,0.3)] md:p-8">
        <div className="mb-4 border-b border-[#ff0033]/20 pb-3">
          <p className="font-vt323 text-lg tracking-[0.3em] text-[#ff0033]">
            // UPLINK RELAY CONFIGURATION
          </p>
          <h2 className="mt-1 font-orbitron text-xl font-bold uppercase tracking-wider text-white">
            Backend Server Address
          </h2>
          <p className="mt-2 text-xs font-sans text-white/60">
            When deployed to Vercel (HTTPS), browsers block direct HTTP requests to{" "}
            <code className="text-red-400">http://127.0.0.1:8000</code>. Point this to your live Render,
            Railway, or ngrok tunnel URL.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-press-start text-xs text-[#00ff66]">
              API BASE URL
            </label>
            <Input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestStatus("idle");
              }}
              placeholder="https://cerebro-api.onrender.com"
              neon="green"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === "testing" || !url.trim()}
              className="rounded border border-[#00ff66]/50 bg-black/60 px-3 py-2 font-vt323 text-lg uppercase tracking-wider text-[#00ff66] transition hover:bg-[#00ff66]/10 disabled:opacity-40"
            >
              {testStatus === "testing" ? "PINGING..." : "⚡ TEST CONNECTION"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded border border-white/20 bg-black/40 px-3 py-2 font-vt323 text-lg text-white/60 transition hover:text-white"
            >
              RESET TO DEFAULT
            </button>
          </div>

          {statusMessage ? (
            <div
              className={`rounded border p-3 font-vt323 text-lg ${
                testStatus === "success"
                  ? "border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66]"
                  : testStatus === "error"
                  ? "border-[#ff0033]/40 bg-[#ff0033]/10 text-[#ff8a9d]"
                  : "border-white/20 text-white/70"
              }`}
            >
              {statusMessage}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            magnetic={false}
            onClick={onClose}
            className="min-w-0"
          >
            CANCEL
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            magnetic={false}
            onClick={handleSave}
            className="min-w-0"
          >
            SAVE & APPLY
          </Button>
        </div>
      </div>
    </div>
  );
}
