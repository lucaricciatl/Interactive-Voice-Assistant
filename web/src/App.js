
import React from 'react';
import './App.css'; // Import your custom CSS file for styling
import AudioVisualizer from './AudioVisualizer';
import ThreeScene from './scene'; // Adjust the import path as necessary for ThreeScene


function App() {
  return (
    <div className="App">
      <div className="container-fluid"> {/* Use container-fluid for full-width layout */}
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center"> {/* Adjust column width for different screen sizes */}
            <ThreeScene />
            <AudioVisualizer />
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
