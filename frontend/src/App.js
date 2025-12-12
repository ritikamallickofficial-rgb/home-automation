import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [led1, setLed1] = useState(false);
  const [led2, setLed2] = useState(false);

  const fetchStates = async () => {
    try {
      const res = await axios.get('/api/states');   // ← THIS LINE
      setLed1(res.data.led1);
      setLed2(res.data.led2);
    } catch (e) { }
  };

  const toggle = async (led) => {
    await axios.post(`/api/toggle/${led}`);         // ← THIS LINE
    fetchStates();
  };

  useEffect(() => {
    fetchStates();
    const interval = setInterval(fetchStates, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-blue-600 mb-10">Home Automation</h1>
      <div className="space-y-8 max-w-md w-full">

        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">LED 1</h2>
          <div className="text-5xl font-bold mb-6">{led1 ? 'ON' : 'OFF'}</div>
          <button
            onClick={() => toggle('led1')}
            className="w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg transition">
            {led1 ? 'Turn OFF' : 'Turn ON'}
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">LED 2</h2>
          <div className="text-5xl font-bold mb-6">{led2 ? 'ON' : 'OFF'}</div>
          <button
            onClick={() => toggle('led2')}
            className="w-full py-4 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg transition">
            {led2 ? 'Turn OFF' : 'Turn ON'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;