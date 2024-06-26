from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import time
from collections import deque
import threading
import soundfile as sf
import os 
from flask import Flask, send_file, jsonify
import io
import requests
import json 

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

# In-memory storage for audio data
audio_data_storage = {
    'frequency_data': deque(),
    'audio_buffers': deque(),
    'sample_rate': deque()
}

# Maximum duration for keeping data in seconds
MAX_DURATION = 60

# Path to save the WAV files
WAV_FILE_PATH = "saved_audio.wav"

def save_audio_periodically():
    while True:
        time.sleep(10)  # Wait for 10 seconds
        save_audio_data()

def save_audio_data():
    if audio_data_storage['audio_buffers']:
        # Collect all audio buffers
        all_audio_data = np.concatenate([buffer[1] for buffer in audio_data_storage['frequency_data']])
        sample_rate = audio_data_storage['sample_rate'][0][1]  # Assuming all have the same sample rate
        
        # Save to WAV file
        sf.write(WAV_FILE_PATH, all_audio_data, sample_rate)
        print(f"Saved audio data to {WAV_FILE_PATH}")

@app.route('/audio-wav', methods=['POST'])
def send_audio_wav():

    try:
        # Assuming your .wav file is stored in a directory named 'audio_files'
        audio_file_path = 'synthesized_audio.mp3'  # Update with your actual file path

        # Check if the file exists
        if not os.path.isfile(audio_file_path):
            return jsonify({'error': 'Audio file not found'}), 404

        # Optionally, you can perform some processing here before sending the file
        # Example: read the file and convert it to bytes
        with open(audio_file_path, 'rb') as f:
            audio_data = f.read()
        
        os.remove(audio_file_path)
            
        # Return the .wav file as a response
        return send_file(
            io.BytesIO(audio_data),
            mimetype='audio/wav',
            as_attachment=True,
            download_name='audio.mp3'  # Providing a filename for the downloaded file
        )
    


    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/frequency-data', methods=['POST', 'OPTIONS'])
def receive_frequency_data():
    if request.method == 'OPTIONS': 
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        return response, 200

    if not request.is_json:
        return jsonify({"error": "Invalid data format, JSON expected"}), 400

    data = request.get_json()
    frequency_data = data.get('frequencyData')
    audio_buffer = data.get('audioBuffer')
    sample_rate = data.get('sampleRate')
    
    if frequency_data is None or audio_buffer is None or sample_rate is None:
        return jsonify({"error": "Missing data: frequencyData, audioBuffer, and sampleRate are required"}), 400

    # Decode the audio buffer from Base64
    try:
        decoded_audio_buffer = base64.b64decode(audio_buffer)
        audio_buffer_np = np.frombuffer(decoded_audio_buffer, dtype=np.float32)
    except Exception as e:
        return jsonify({"error": "Error decoding audio buffer", "message": str(e)}), 400

    # Current timestamp
    current_time = time.time()
    
    # Store the frequency data and audio buffer with a timestamp
    audio_data_storage['frequency_data'].append((current_time, frequency_data))
    audio_data_storage['audio_buffers'].append((current_time, audio_buffer_np))
    audio_data_storage['sample_rate'].append((current_time, sample_rate))

    # Remove old data exceeding MAX_DURATION
    while audio_data_storage['frequency_data'] and current_time - audio_data_storage['frequency_data'][0][0] > MAX_DURATION:
        audio_data_storage['frequency_data'].popleft()
    while audio_data_storage['audio_buffers'] and current_time - audio_data_storage['audio_buffers'][0][0] > MAX_DURATION:
        audio_data_storage['audio_buffers'].popleft()
    while audio_data_storage['sample_rate'] and current_time - audio_data_storage['sample_rate'][0][0] > MAX_DURATION:
        audio_data_storage['sample_rate'].popleft()

    return jsonify({"status": "success", "message": "Data received"}), 200

def request_synthetization(url, text, conditions=None, temperature=None, stream=None, audio_input=None, output_wav=None, language=None, sample_rate=None, emotion=None):
    headers = {'Content-Type': 'application/json'}
    
    # Prepare the payload
    payload = {
        'text': text,
        'gpt_cond_len': conditions,
        'temperature': temperature,
        'stream': stream,
        'audio_input': audio_input,
        'output_wav': "synthesized_audio.mp3",
        'language': language,
        'sample_rate': sample_rate,
        'emotion': emotion
    }
    
    # Remove keys with None values
    payload = {k: v for k, v in payload.items() if v is not None}
    
    # Send POST request
    try:
        response = requests.post(url, headers=headers, data=json.dumps(payload))
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Handle response
        if response.status_code == 200:
            # Save the response content (the audio file)
            with open('synthesized_audio.mp3', 'wb') as file:
                file.write(response.content)
            print("Synthesis successful, file saved as 'synthesized_audio.mp3'")
        else:
            print(f"Failed to synthesize. Status code: {response.status_code}, Response: {response.text}")
    
    except requests.RequestException as e:
        print(f"An error occurred: {e}")
# Example usage
#request_synthetization(
#    url='http://127.0.0.1:5000/synthesize',  # URL of the Flask server
#    text='Hello, world!',
#    temperature=0.7
#)
    
def send_text_to_llm(text):
    response =True #the response from the llm
    audio = request_synthetization(
    url='http://192.168.18.36:5200/synthesize',  #message will be forwarded automatically :D
    text="response",
    temperature=0.7
    )

    return True

if __name__ == '__main__':
    # Start the background thread
    threading.Thread(target=save_audio_periodically, daemon=True).start()
    
    # Run the Flask app
    context = ('certificate.crt', 'private.key')
    app.run(host='0.0.0.0', port=443, ssl_context=context, debug=True)