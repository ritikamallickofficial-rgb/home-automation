import React, { useCallback, useEffect, useState } from 'react';

const DEVICE_META = {
  led1: {
    name: 'Entrance lights',
    label: 'Zone A',
    icon: 'L1',
    description: 'A warm welcome glow for hallways or porches.',
    tip: 'Great for arrival scenes.',
  },
  led2: {
    name: 'Workspace strip',
    label: 'Zone B',
    icon: 'L2',
    description: 'Task lighting that keeps your desk bright and focused.',
    tip: 'Use for productivity or video calls.',
  },
};

const normaliseStates = (payload = {}) => ({
  led1: !!payload.led1,
  led2: !!payload.led2,
});

function App() {
  const [leds, setLeds] = useState(normaliseStates());
  const [pending, setPending] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncedAt, setSyncedAt] = useState(null);

  const fetchStates = useCallback(async () => {
    try {
      const res = await fetch('/api/states');
      if (!res.ok) throw new Error('Failed to fetch state');
      const data = await res.json();
      setLeds(normaliseStates(data));
      setError('');
      setSyncedAt(new Date());
    } catch (err) {
      setError('Unable to reach the controller. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStates();
    const interval = setInterval(fetchStates, 5000);
    return () => clearInterval(interval);
  }, [fetchStates]);

  const toggleDevice = async (target) => {
    setPending(target);
    try {
      const res = await fetch(`/api/toggle/${target}`, { method: 'POST' });
      if (!res.ok) throw new Error('Toggle failed');
      const data = await res.json();
      setLeds(normaliseStates(data));
      setError('');
      setSyncedAt(new Date());
    } catch (err) {
      setError('Toggle failed. Please try again.');
    } finally {
      setPending('');
      setLoading(false);
    }
  };

  const refreshStates = () => {
    setLoading(true);
    fetchStates();
  };

  const statusText = error ? 'Offline' : 'Live connection';
  const statusColor = error ? 'bg-rose-400' : 'bg-emerald-400';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-4 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/25 to-cyan-400/15 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-80 w-80 rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/25 blur-3xl" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_1px,_transparent_0)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Home automation</p>
            <h1 className="text-4xl md:text-5xl font-semibold mt-2">Lighting control</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
              Elegant toggles wired to your backend. Every press updates Firebase and keeps the UI synced in seconds.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-full shadow-lg">
              <span className={`h-3 w-3 rounded-full ${statusColor} ${error ? '' : 'animate-pulse'}`} />
              <span className="text-sm font-medium">{statusText}</span>
              <span className="text-xs text-slate-400">
                {syncedAt ? `Synced ${syncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Waiting for sync'}
              </span>
            </div>
            {error ? (
              <span className="text-rose-300 text-sm">Backend unreachable. Buttons are paused.</span>
            ) : (
              <span className="text-emerald-200/80 text-sm">Backend ready - commands apply instantly.</span>
            )}
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(DEVICE_META).map((id) => {
            const isOn = leds[id];
            const meta = DEVICE_META[id];
            return (
              <div key={id} className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300" />
                <div className="relative p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-slate-800 flex items-center justify-center text-2xl">
                        {meta.icon}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{meta.label}</p>
                        <p className="text-xl font-semibold">{meta.name}</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                        isOn
                          ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          isOn ? 'bg-emerald-300 shadow-[0_0_0_3px] shadow-emerald-500/40' : 'bg-slate-500'
                        }`}
                      />
                      {isOn ? 'On' : 'Off'}
                    </div>
                  </div>

                  <p className="text-sm text-slate-400">{meta.description}</p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => toggleDevice(id)}
                      disabled={!!pending || loading}
                      className={`relative overflow-hidden rounded-2xl px-6 py-4 text-lg font-semibold transition transform active:scale-[0.99] disabled:cursor-not-allowed ${
                        isOn ? 'text-slate-900' : 'text-white'
                      } ${pending === id ? 'opacity-75' : ''}`}
                    >
                      <span
                        className={`absolute inset-0 transition-all ${
                          isOn
                            ? 'bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-200'
                            : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400'
                        } ${pending === id ? 'blur-[1px]' : ''}`}
                      />
                      <span className="relative">
                        {pending === id ? 'Switching...' : isOn ? 'Turn off' : 'Turn on'}
                      </span>
                    </button>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{meta.tip}</span>
                      <span className="flex items-center gap-1">
                        <span className={`h-2 w-2 rounded-full ${isOn ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {isOn ? 'Powering this zone' : 'Currently idle'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toggleDevice('all')}
              disabled={!!pending || loading}
              className="px-5 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Toggle both lights
            </button>
            <button
              onClick={refreshStates}
              disabled={!!pending}
              className="px-5 py-3 rounded-full border border-slate-800 bg-slate-900/80 text-slate-100 font-medium hover:border-slate-600 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh from backend
            </button>
          </div>
          <p className="text-sm text-slate-400">
            {loading
              ? 'Syncing with Firebase...'
              : error
                ? 'Tap refresh if devices look out of sync.'
                : 'Status updates auto-refresh every few seconds.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
