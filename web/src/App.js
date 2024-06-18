import React from 'react';
import AudioVisualizer from './AudioVisualizer';
import ThreeScene from './scene'; // Adjust the import path as necessary for ThreeScene

function App() {
  return (
    <div className="App">
      <div className="container-fluid">
        <div className="row">
          <div className="col">
            <ThreeScene />
          </div>
          <div className="col">
            <AudioVisualizer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
