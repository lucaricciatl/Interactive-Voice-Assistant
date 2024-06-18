from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app)

@app.route('/frequency-data', methods=['POST'])
def receive_frequency_data():
    if not request.is_json:
        return jsonify({"error": "Invalid data format, JSON expected"}), 400
    
    data = request.get_json()
    frequency_data = data.get('frequencyData')
    audio_buffer = data.get('audioBuffer')
    
    if frequency_data is None:
        return jsonify({"error": "Missing frequency data"}), 400
    if audio_buffer is None:
        return jsonify({"error": "Missing audio buffer"}), 400
    
    # Decode the audio buffer from Base64
    try:
        decoded_audio_buffer = base64.b64decode(audio_buffer)
        audio_buffer_np = np.frombuffer(decoded_audio_buffer, dtype=np.float32)
    except Exception as e:
        return jsonify({"error": "Error decoding audio buffer", "message": str(e)}), 400

    # Process the frequency_data and audio_buffer as needed
    print('Received frequency data length:', len(frequency_data))
    print('Received audio buffer length:', len(audio_buffer_np))
    
    # For demonstration, just return the lengths of the received data
    return jsonify({"status": "success", "message": "Data received", "frequency_data_length": len(frequency_data), "audio_buffer_length": len(audio_buffer_np)}), 200

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
