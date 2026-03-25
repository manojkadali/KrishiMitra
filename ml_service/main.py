import io
import json
import os
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import uvicorn

# Set TensorFlow log level to suppress non-critical warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf

app = FastAPI(title="KrishiMitra ML Service - Disease Detection (Custom Keras Model)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === LOAD CUSTOM MODEL & CLASSES ===
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "plant_disease_model.h5")
CLASSES_PATH = os.path.join(os.path.dirname(__file__), "model", "class_names.json")

print("Loading Custom Keras Model...")
model = None
try:
    if os.path.exists(MODEL_PATH):
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully.")
    else:
        print(f"WARNING: Model not found at {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")

class_names = []
try:
    if os.path.exists(CLASSES_PATH):
        with open(CLASSES_PATH, 'r') as f:
            class_names = json.load(f)
        print(f"Loaded {len(class_names)} classes.")
    else:
        print(f"WARNING: Class names not found at {CLASSES_PATH}")
except Exception as e:
    print(f"Error loading class names: {e}")

# === TREATMENT MAPPINGS ===
# Map the user's specific 15 classes to recommended treatments.
TREATMENTS = {
    "Pepper__bell___Bacterial_spot": "Apply copper-based fungicides. Ensure seeds are certified disease-free.",
    "Pepper__bell___healthy": "No treatment needed. Continue standard watering and fertilizing.",
    "Potato___Early_blight": "Apply fungicides like chlorothalonil or mancozeb. Practice crop rotation.",
    "Potato___Late_blight": "Apply fungicides containing metalaxyl or copper. Ensure good field drainage.",
    "Potato___healthy": "No treatment needed. Continue standard care.",
    "Tomato_Bacterial_spot": "Apply copper sprays. Avoid overhead watering to reduce leaf wetness.",
    "Tomato_Early_blight": "Remove affected leaves. Apply fungicide like mancozeb or chlorothalonil.",
    "Tomato_Late_blight": "Apply specific fungicides immediately. Destroy heavily infected plants to stop spread.",
    "Tomato_Leaf_Mold": "Improve air circulation. Apply fungicides if severe.",
    "Tomato_Septoria_leaf_spot": "Remove infected lower leaves. Apply copper-based fungicide.",
    "Tomato_Spider_mites_Two_spotted_spider_mite": "Spray with insecticidal soap or neem oil. Introduce predatory mites.",
    "Tomato__Target_Spot": "Ensure good ventilation. Apply suitable fungicide (e.g., chlorothalonil).",
    "Tomato__Tomato_YellowLeaf__Curl_Virus": "Control whitefly populations. Remove and destroy infected plants immediately.",
    "Tomato__Tomato_mosaic_virus": "No cure exists. Remove and destroy infected plants. Wash hands and tools frequently.",
    "Tomato_healthy": "No treatment needed. Continue standard care."
}

def preprocess_image(image_bytes):
    # Standard Keras preprocessing (224x224 is required for MobileNetV2 derivatives)
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((224, 224)) 
    img_array = np.array(img) / 255.0  # Normalize to [0,1]
    img_array = np.expand_dims(img_array, axis=0)  # Shape: (1, 224, 224, 3)
    return img_array

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "classes_loaded": len(class_names) > 0
    }

@app.post("/predict")
async def predict_disease(image: UploadFile = File(...)):
    if model is None or len(class_names) == 0:
        return JSONResponse({"success": False, "error": "Model or class names not initialized"}, status_code=503)

    try:
        contents = await image.read()
        processed_img = preprocess_image(contents)
        
        # Run Keras inference
        predictions = model.predict(processed_img)
        predicted_idx = np.argmax(predictions[0])
        confidence_percent = round(float(predictions[0][predicted_idx]) * 100, 2)
        
        predicted_class = class_names[predicted_idx]
        treatment = TREATMENTS.get(predicted_class, "Consult a local agricultural expert.")

        # Enforce strict < 60% confidence handling
        if confidence_percent < 60.0:
            return JSONResponse({
                "success": True,
                "disease": "Uncertain",
                "confidence": confidence_percent,
                "treatment": "Confidence too low. Please upload a clearer image of the leaf.",
                "low_confidence": True
            })
            
        return JSONResponse({
            "success": True,
            "disease": predicted_class.replace("___", " - ").replace("_", " "),
            "confidence": confidence_percent,
            "treatment": treatment,
            "low_confidence": False
        })
        
    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
