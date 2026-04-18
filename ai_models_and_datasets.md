# KrishiMitra: AI Models and Datasets

This document provides a comprehensive overview of the Artificial Intelligence (AI) and Machine Learning (ML) integration within the KrishiMitra project. The platform leverages two distinct AI systems to provide agricultural advisories.

## 1. Plant Disease Detection System

This module allows users to upload images of plant leaves, and it infers whether the plant is healthy or suffering from a specific disease.

### Model Details
- **Architecture**: A Convolutional Neural Network (CNN) built with **TensorFlow/Keras**. The model structure requires an image input size of `224x224`, which strongly suggests a transfer-learning derivative of the **MobileNetV2** architecture, optimized for fast and lightweight image classification tasks.
- **Serving Mechanism**: The model is exported in the H5 format (`plant_disease_model.h5`) and served via a FastAPI endpoint in the backend (`ml_service/main.py`). The inputs are preprocessed specifically by normalizing the array and applying Keras-standard preparation.
- **Capabilities**: The model can classify the user upload into **15 distinct categories**, explicitly trained on three main crops:
  - **Pepper (Bell)**: Healthy, Bacterial Spot
  - **Potato**: Healthy, Early Blight, Late Blight
  - **Tomato**: Healthy, Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria Leaf Spot, Spider Mites, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus
- **Failure Handling**: It implements a strict inference confidence threshold (< 60%) to prevent false positives and asks for a clearer image if the prediction is uncertain.

### Dataset Used
- **The PlantVillage Dataset**: The underlying data used to train this model originates from the famous open-source "PlantVillage" leaf dataset. It features tens of thousands of image pairings mapping crop classes against their respective diseased and healthy states.

---

## 2. Crop Cultivation Advisory System

This system takes live environmental and soil data to recommend the most optimal crop to plant in order to maximize yield and profitability.

### Model Details
- **Architecture**: A Traditional Machine Learning classification algorithm (such as Random Forest, Support Vector Classification, or Decision Tree). We know this because the model is saved as a Python Pickle (`.pkl`) object and exposes generic classifier methods like `predict()` and `predict_proba()` via the `joblib` module.
- **Feature Inputs**: It relies on tabular numerical inputs combining both local environment conditions and soil health: 
  - `N` (Nitrogen ratio in soil)
  - `P` (Phosphorous ratio)
  - `K` (Potassium ratio)
  - `temperature` (°C)
  - `humidity` (%)
  - `ph` (pH value)
  - `rainfall` (Rolling historical rainfall, calculated dynamically from weather services)
- **Serving Mechanism**: The model (`crop_model.pkl`) acts as a microservice running under its own FastAPI server in `crop_api/app.py`. It leverages the **Pandas** library to structure incoming API requests tightly to match its training feature configuration exactly.
- **Inference Results**: It yields an absolute `recommended_crop` and a sorted percentage array of `top_predictions` based on internal decision confidence thresholds.

### Dataset Used
- **Crop Recommendation Dataset**: This model was likely trained using the publicly available "Crop Recommendation Dataset" (commonly hosted on platforms like Kaggle). It synthesizes N, P, K, and climate metrics to specific crop labels (like apple, banana, blackgram, chickpea, coconut, coffee, cotton, grapes, jute, kidneybeans, lentil, maize, mango, mothbeans, mungbean, muskmelon, orange, papaya, pigeonpeas, pomegranate, rice, watermelon).

> [!TIP]
> Both AI functions operate independently through container-ready Python servers (using HTTP calls across services) so that heavy computational tasks like image recognition are decoupled from normal core Javascript logic!
