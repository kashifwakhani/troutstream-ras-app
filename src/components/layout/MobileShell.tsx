import React, { useState } from 'react';
import {
  LayoutDashboard,
  Waves,
  Droplets,
  Utensils,
  Activity,
  BarChart3,
  Sliders,
  Plus,
  RefreshCw,
  Smartphone,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Terminal,
  Check,
} from 'lucide-react';
import { FarmState } from '../../services/farmStorage';

export type TabType = 'dashboard' | 'tanks' | 'water' | 'feed' | 'health_growth' | 'operations' | 'reports' | 'settings';

interface MobileShellProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  state: FarmState;
  onOpenQuickAction: () => void;
  onResetData: () => void;
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  currentTab,
  onSelectTab,
  state,
  onOpenQuickAction,
  onResetData,
  children,
}) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculate alerts
  const criticalReadings = state.waterQualityReadings.filter((r) => r.status === 'critical');
  const warningReadings = state.waterQualityReadings.filter((r) => r.status === 'warning');
  const lowStockItems = state.inventory.filter((i) => i.currentStock <= i.minThreshold);
  const totalAlertCount = criticalReadings.length + warningReadings.length + lowStockItems.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Application Bar */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
              🐟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  TroutStream <span className="text-cyan-400 font-extrabold">RAS</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  96% Recirculation
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
                {state.farmInfo.name} • {state.farmInfo.species.split(' ')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alert badge if any */}
            {totalAlertCount > 0 && (
              <button
                onClick={() => onSelectTab('water')}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
                title={`${totalAlertCount} farm alert(s)`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{totalAlertCount}</span>
              </button>
            )}

            {/* Run on Phone / Android Guide */}
            <button
              onClick={() => setShowPhoneModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800 text-xs font-semibold transition-colors"
              title="How to run on Android phone"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Phone Guide</span>
            </button>

            {/* View Mode Toggle (Mobile Simulator vs Full Canvas) */}
            <button
              onClick={() => setDeviceFrameMode(!deviceFrameMode)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title={deviceFrameMode ? 'Switch to Full Screen View' : 'Switch to Mobile App Frame'}
            >
              {deviceFrameMode ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={onResetData}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Reset Demo Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        className={`w-full flex-1 flex flex-col transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-[430px] my-2 sm:my-4 rounded-[36px] border border-slate-800/80 bg-slate-900/60 shadow-2xl overflow-hidden'
            : 'max-w-5xl px-4 py-4'
        }`}
      >
        {/* Mobile Device Status Header (Simulated iPhone notch/status bar) */}
        {deviceFrameMode && (
          <div className="bg-slate-950/80 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] text-slate-400 select-none border-b border-slate-800/50">
            <span className="font-semibold text-slate-300 font-mono">08:42</span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">RAS-LTE</span>
              <span className="text-slate-300">100%</span>
            </div>
          </div>
        )}

        {/* Dynamic Screen Content */}
        <div className="flex-1 overflow-y-auto pb-24 p-4">{children}</div>

        {/* Mobile Floating Action Button (Quick Add) */}
        <div className="fixed bottom-20 right-4 sm:bottom-20 z-30">
          <button
            onClick={onOpenQuickAction}
            className="flex items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all focus:outline-none ring-4 ring-cyan-500/20"
            title="Quick Action"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        {/* Bottom Tab Navigation Bar */}
        <nav className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 py-1.5 px-2 sticky bottom-0 z-30">
          <div className="grid grid-cols-6 gap-1 items-center max-w-lg mx-auto">
            {/* Dashboard */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                currentTab === 'dashboard'
                  ? 'text-cyan-400 font-bold bg-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Home</span>
            </button>

            {/* Tanks */}
            <button
              onClick={() => onSelectTab('tanks')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                currentTab === 'tanks'
                  ? 'text-cyan-400 font-bold bg-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Waves className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Tanks</span>
            </button>

            {/* Water Quality */}
            <button
              onClick={() => onSelectTab('water')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                currentTab === 'water'
                  ? 'text-cyan-400 font-bold bg-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Droplets className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Water</span>
            </button>

            {/* Feed */}
            <button
              onClick={() => onSelectTab('feed')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                currentTab === 'feed'
                  ? 'text-cyan-400 font-bold bg-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Feed</span>
            </button>

            {/* Operations & Equipment */}
            <button
              onClick={() => onSelectTab('operations')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                currentTab === 'operations' || currentTab === 'health_growth'
                  ? 'text-cyan-400 font-bold bg-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Farm Ops</span>
            </button>

            {/* Reports & Config */}
            <button
              onClick={() => onSelectTab('reports')}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                currentTab === 'reports' || currentTab === 'settings'
                  ? 'text-cyan-400 font-bold bg-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">Reports</span>
            </button>
          </div>
        </nav>
      </main>

      {/* Run on Phone Guide Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">How to Run on Android Phone</h3>
                  <p className="text-xs text-slate-400">Best options from your Ubuntu & VS Code setup</p>
                </div>
              </div>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
              {/* Method 1: Instant PWA Link (Recommended) */}
              <div className="bg-gradient-to-br from-cyan-950/40 to-slate-950 p-4 rounded-2xl border border-cyan-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Method 1: Instant PWA (Recommended)
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                    No Build Required
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Open this link in <strong>Google Chrome</strong> on your Android phone, then tap the menu (⋮) and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>. It installs as a full-screen native-like Android app!
                </p>

                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={window.location.origin}
                    className="flex-1 bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy URL'}
                  </button>
                </div>
              </div>

              {/* Method 2: Local Wi-Fi from Ubuntu */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">
                  Method 2: Local Wi-Fi (Ubuntu VS Code to Phone)
                </span>
                <p className="text-[11px] text-slate-400">
                  If your Ubuntu PC and Android phone are on the same Wi-Fi:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300">
                  <li>
                    In Ubuntu terminal, run: <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono">hostname -I</code> to find your local IP (e.g. <span className="text-cyan-400">192.168.1.50</span>).
                  </li>
                  <li>
                    Run: <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono">npm run dev</code> (it listens on 0.0.0.0:3000).
                  </li>
                  <li>
                    On your phone's browser, open: <code className="bg-slate-900 px-1 py-0.5 rounded text-cyan-300 font-mono">http://&lt;UBUNTU_IP&gt;:3000</code>.
                  </li>
                </ol>
                <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-lg">
                  💡 <strong>USB Cable Alternative:</strong> Connect phone via USB, enable USB Debugging, and run: <code className="text-cyan-300">adb reverse tcp:3000 tcp:3000</code>. Then open <code className="text-cyan-300">http://localhost:3000</code> on your phone!
                </div>
              </div>

              {/* Method 3: Native Android APK with Capacitor */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block text-xs">
                  Method 3: Build Standalone Android APK (Capacitor)
                </span>
                <p className="text-[11px] text-slate-400">
                  To generate an installable <code className="text-slate-300">.apk</code> file for Google Play or direct installation:
                </p>
                <div className="bg-slate-900 p-2.5 rounded-xl font-mono text-[10px] text-cyan-300 space-y-1 overflow-x-auto">
                  <div># 1. Install Capacitor in project:</div>
                  <div className="text-white">npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                  <div># 2. Initialize Android container:</div>
                  <div className="text-white">npx cap init "TroutStream RAS" "com.troutstream.ras" --web-dir=dist</div>
                  <div># 3. Build & sync to Android Studio:</div>
                  <div className="text-white">npm run build && npx cap add android && npx cap open android</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPhoneModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
