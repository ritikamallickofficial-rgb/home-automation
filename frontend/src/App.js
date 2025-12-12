import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';  // This imports Tailwind

function App() {
  const [led1, setLed1] = useState(false);
  const [led2, setLed2] = useState(false);

  const fetchStates = async () => {
    try {
      const res = await axios.get('/api/states');
      setLed1(res.data.led1);
      setLed2(res.data.led2);
    } catch (e) { }
  };

  const toggle = async (led) => {
    await axios.post(`/api/toggle/${led}`);
    fetchStates();
  };

  useEffect(() => {
    fetchStates();
    const interval = setInterval(fetchStates, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">My Home Automation</h1>
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">LED 1</h2>
          <div className="text-4xl font-bold mb-4">{led1 ? 'ON' : 'OFF'}</div>
          <button
            onClick={() => toggle('led1')}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {led1 ? 'Turn OFF' : 'Turn ON'}
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">LED 2</h2>
          <div className="text-4xl font-bold mb-4">{led2 ? 'ON' : 'OFF'}</div>
          <button
            onClick={() => toggle('led2')}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {led2 ? 'Turn OFF' : 'Turn ON'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;