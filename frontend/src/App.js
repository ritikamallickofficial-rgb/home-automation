import React, { useState, useEffect } from 'react';

function App() {
  const [led1, setLed1] = useState(false);
  const [led2, setLed2] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await fetch('/api/states');
        const data = await res.json();
        setLed1(data.led1 || false);
        setLed2(data.led2 || false);
      } catch (e) { }
    };
    fetchStates();
    const interval = setInterval(fetchStates, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggle = async (led) => {
    try {
      await fetch(`/api/toggle/${led}`, { method: 'POST' });
    } catch (e) { }
  };

  return (
    <div className={`min-h-screen transition-all ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold">My Home Automation</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 transition"
          >
            {darkMode ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LED 1 */}
          <div className={`p-10 rounded-3xl shadow-2xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:scale-105 transition`}>
            <div className="text-7xl mb-6">{led1 ? 'ON' : 'OFF'}</div>
            <h2 className="text-3xl font-bold mb-8">LED 1</h2>
            <button
              onClick={() => toggle('led1')}
              className={`w-full py-6 text-2xl font-bold rounded-2xl text-white ${led1 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {led1 ? 'Turn OFF' : 'Turn ON'}
            </button>
          </div>

          {/* LED 2 */}
          <div className={`p-10 rounded-3xl shadow-2xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} hover:scale-105 transition`}>
            <div className="text-7xl mb-6">{led2 ? 'ON' : 'OFF'}</div>
            <h2 className="text-3xl font-bold mb-8">LED 2</h2>
            <button
              onClick={() => toggle('led2')}
              className={`w-full py-6 text-2xl font-bold rounded-2xl text-white ${led2 ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {led2 ? 'Turn OFF' : 'Turn ON'}
            </button>
          </div>
        </div>

        <div className="text-center mt-16">
          <button
            onClick={() => { toggle('led1'); toggle('led2'); }}
            className="px-16 py-6 bg-indigo-600 hover:bg-indigo-700 text-white text-2xl font-bold rounded-full shadow-2xl"
          >
            Toggle Both LEDs
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;