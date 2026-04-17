import sys
import os

print(f"Python Version: {sys.version}")

try:
    import tensorflow as tf
    import tf2onnx
    import onnx
    print("TensorFlow and tf2onnx are installed and ready to convert.")
except ImportError as e:
    print(f"Error importing required modules: {e}")
    print("Cannot proceed with conversion. Ensure tensorflow and tf2onnx are installed in this environment.")
    sys.exit(1)

model_path = os.path.join("model", "plant_disease_model.h5")
onnx_path = os.path.join("model", "plant_disease_model.onnx")

print(f"Attempting to load Keras model from {model_path}...")

try:
    # Load Keras model
    model = tf.keras.models.load_model(model_path)
    print("Model loaded successfully.")
    
    # Define input signature based on the model's actual expected input shape
    # We use None for batch size to allow dynamic batching
    print("Defining input signature...")
    # Get the input shape from the first layer of the model
    input_shape = model.input_shape
    print(f"Model expected input shape: {input_shape}")
    
    # If the model input doesn't have a defined batch dimension (e.g. (?, 256, 256, 3))
    # We replace the first dimension with None in our TensorSpec
    spec_shape = [None] + list(input_shape)[1:] 
    spec = (tf.TensorSpec(spec_shape, tf.float32, name="input"),)
    
    # Convert from Keras to ONNX
    print("Converting to ONNX format...")
    model_proto, _ = tf2onnx.convert.from_keras(model, input_signature=spec, opset=13)
    
    # Save the ONNX model
    print(f"Saving ONNX model to {onnx_path}...")
    onnx.save(model_proto, onnx_path)
    print("Conversion complete!")
    
except Exception as e:
    print(f"Conversion failed: {e}")
