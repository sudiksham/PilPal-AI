from flask import Flask, request, jsonify
from mobile_upload import process_prescription_from_mobile
import os
from dotenv import load_dotenv
import tempfile

load_dotenv()  # Load environment variables

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/upload-prescription', methods=['POST'])
def upload_prescription():
    try:
        if 'prescription' not in request.files:
            return jsonify({"error": "No prescription image provided"}), 400
            
        file = request.files['prescription']
        
        # Save temporarily
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, 'prescription.jpg')
        file.save(temp_path)
        
        # Process prescription
        result = process_prescription_from_mobile(temp_path)
        
        # Cleanup
        os.remove(temp_path)
        os.rmdir(temp_dir)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)