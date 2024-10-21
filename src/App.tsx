import React, { useState, useEffect } from 'react';
import DebugWindow from './components/DebugWindow';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Component mounted');
    return () => {
      console.log('Component will unmount');
    };
  }, []);

  const incrementCount = () => {
    setCount(prevCount => prevCount + 1);
    console.log(`Count incremented to ${count + 1}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
      const data = await response.json();
      console.log('Fetched data:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const triggerError = () => {
    try {
      throw new Error('This is a sample error message with stack trace');
    } catch (error) {
      console.error(error);
    }
  };

  const loadLargeImage = () => {
    const img = new Image();
    img.src = 'https://source.unsplash.com/random/3840x2160';
    img.onload = () => console.log('Large image loaded');
    img.onerror = (error) => console.error('Error loading large image:', error);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className='text-3xl font-bold md-4'>Consle insights</h1>
      <h1 className="text-3xl font-bold mb-4">Enhanced Debug Window Demo</h1>
      <p className="mb-4">Count: {count}</p>
      <div className="space-x-4 mb-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={incrementCount}
        >
          Increment Count
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={fetchData}
        >
          Fetch Data
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={triggerError}
        >
          Trigger Error
        </button>
        <button
          className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          onClick={loadLargeImage}
        >
          Load Large Image
        </button>
      </div>
      <DebugWindow />
    </div>
  );
}

export default App;