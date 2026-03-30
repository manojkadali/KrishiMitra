from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI(title="Crop Advisory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model at application startup
# Do NOT reload the model on every request
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'crop_model.pkl')
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully.")
except Exception as e:
    model = None
    print(f"Failed to load crop_model.pkl: {e}")

class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@app.get("/")
def read_root():
    return {"message": "API running"}

@app.post("/predict")
def predict_crop(data: CropInput):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please ensure crop_model.pkl is placed in the API directory.")
    
    try:
        # Convert incoming JSON into a pandas DataFrame with correct column names exactly matching training data
        columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
        input_data = pd.DataFrame([[
            data.N, data.P, data.K, data.temperature, data.humidity, data.ph, data.rainfall
        ]], columns=columns)
        
        # Use model.predict() to get recommended crop
        prediction = model.predict(input_data)[0]
        
        # Use model.predict_proba() to get probabilities
        probabilities = model.predict_proba(input_data)[0]
        
        # Extract top 3 crops with highest probabilities and convert probabilities to percentage
        classes = model.classes_
        prob_list = []
        for i, class_name in enumerate(classes):
            confidence = round(float(probabilities[i]) * 100, 2)
            prob_list.append({"crop": str(class_name), "confidence": confidence})
            
        prob_list.sort(key=lambda x: x["confidence"], reverse=True)
        top_3 = prob_list[:3]
        
        return {
            "recommended_crop": str(prediction),
            "top_predictions": top_3
        }

    except Exception as e:
        # Return error if any unexpected issue happens
        raise HTTPException(status_code=400, detail=str(e))
