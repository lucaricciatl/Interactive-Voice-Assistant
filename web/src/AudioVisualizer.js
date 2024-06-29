import React, { useEffect, useRef, useState } from 'react';
import './App.css'; // Import the CSS file

function AudioVisualizer() {
  const canvasRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkGetUserMediaSupport = () => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    };

    if (!checkGetUserMediaSupport()) {
      setError('getUserMedia is not supported in this browser');
      console.error('getUserMedia is not supported in this browser');
      return;
    }

  const initAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 32;
  
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyserNode);
  
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let audioBuffer = [];
  
      const canvas = canvasRef.current;
      const canvasCtx = canvas.getContext('2d');
  
  
      // Throttled function to send audio data
      //const sendAudioData = async (frequencyData, audioBuffer) => {
      //  try {
        //  // Encode the audio buffer to base64
        //  const array = new Float32Array(audioBuffer);
        //  const encodedAudioBuffer = btoa(String.fromCharCode(...array));
        //  const payload = {
        //    frequencyData: Array.from(array),
        //    audioBuffer: encodedAudioBuffer,
        //    sampleRate: audioCtx.sampleRate,
        //  };
  //
        //  const response = await fetch('https://192.168.18.36/frequency-data', {
        //    method: 'POST',
        //    headers: {
        //      'Content-Type': 'application/json',
        //      'Access-Control-Allow-Origin': "*"
        //    },
        //    body: JSON.stringify(payload),
        //  });
  //
        //  // Check for response status
        //  if (!response.ok) {
        //    throw new Error(`HTTP error! status: ${response.status}`);
        //  }
  //
        //  // Request was successful
        //  console.log('Audio data sent successfully');
  
    //    } catch (err) {
    //      console.error('Error sending audio data', err);
    //    }
    //  }; // Maximum of 1 calls per second (1000 ms)
  
      const draw = () => {
        requestAnimationFrame(draw);
  
        analyserNode.getByteFrequencyData(dataArray);
        //sendAudioData(dataArray, audioBuffer.slice()); // Send frequency data and audio buffer
  
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  
        const barWidth = canvas.width / 20; // Width of each soundbar
        const barSpacing = canvas.width / 10; // Space between each soundbar
        const maxBarHeight = canvas.height * 0.75; // Maximum height of the bars
        const circleRadius = barWidth / 2; // Radius of the circles
        const minBarHeight = canvas.height / 20; // Minimum height of the bars
  
        for (let i = 0; i < 7; i++) {
          const index = (i % 2 !== 0) ? (9 - 1 - i) : i;
          const value = dataArray[index];
          const x = 40+barSpacing * (i + 1);
          let barHeight = (value / 255) * maxBarHeight; // Normalize the value and scale it to the canvas height
  
          if (barHeight < minBarHeight) {
            barHeight = minBarHeight;
          }
  
          // Draw the soundbar without gradient
          canvasCtx.fillStyle = 'rgba(0, 0, 0, 1)';
          canvasCtx.fillRect(x - barWidth / 2, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
  
          // Draw the top arc
          canvasCtx.beginPath();
          canvasCtx.arc(x, (canvas.height / 2) - (barHeight / 2), circleRadius, 0, Math.PI, true);
          canvasCtx.fill();
  
          // Draw the bottom arc
          canvasCtx.beginPath();
          canvasCtx.arc(x, (canvas.height / 2) + (barHeight / 2), circleRadius, 0, Math.PI, false);
          canvasCtx.fill();
        }
      };
  
      const scriptNode = audioCtx.createScriptProcessor(1024, 1, 1);
      source.connect(scriptNode);
      scriptNode.connect(audioCtx.destination);
  
      scriptNode.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0);
        audioBuffer = [...audioBuffer, ...inputData]; // Append new data to audioBuffer
        if (audioBuffer.length > audioCtx.sampleRate) {
          audioBuffer = audioBuffer.slice(audioBuffer.length - audioCtx.sampleRate); // Keep only the last second of audio data
        }
      };
  
      draw();
    } catch (err) {
      setError('Error accessing the microphone: ' + err.message);
      console.error('Error accessing the microphone', err);
     }
   };
   
   initAudio();
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);

  return (
    <div className="audio-visualizer-container">
      <canvas ref={canvasRef} width={400} height={300} />
      {error && <p>{error}</p>}
    </div>
  );
}

export default AudioVisualizer;
