# src/api/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from services.predict import get_prediction
from utils.translate import translate_to_english_mymemory

app = Flask(__name__)
# For local dev you can use CORS(app) or restrict to localhost/chrome-extension
CORS(app, resources={r"/predict": {"origins": ["http://localhost:5000", "chrome-extension://*"]}})

@app.route('/predict', methods=['POST', 'OPTIONS'])
@cross_origin(
    origin='*',  # or restrict to the URLs you need
    methods=['POST', 'OPTIONS'],
    allow_headers=["Content-Type"]
)
def predict():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return jsonify({'message': 'CORS preflight success'}), 200

    # Parse JSON
    try:
        data = request.get_json(force=True)
    except Exception:
        return jsonify({"error": "Invalid JSON"}), 400

    comment = data.get("comment", "").strip()
    if not comment:
        return jsonify({"error": "No comment provided"}), 400

    # Translate then predict
    comment_en = translate_to_english_mymemory(comment)
    result = get_prediction(comment_en)

    # get_prediction returns {"error": ..., "details": ...} on failure
    if "error" in result:
        return jsonify(result), 500

    return jsonify({
        "comment": comment_en,
        "predictions": result
    })

if __name__ == '__main__':
    # You can change host/port as needed
    app.run(host='0.0.0.0', port=5000, debug=True)
