import urllib.request
import requests
import sys

try:
    print("Downloading a sample leaf image...")
    urllib.request.urlretrieve("https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Leaf_1_web.jpg/300px-Leaf_1_web.jpg", "sample_leaf.jpg")
    print("Image downloaded. Sending POST to ML API...")
    
    with open("sample_leaf.jpg", "rb") as img:
        res = requests.post("http://localhost:8000/predict", files={"image": img})
        
    print(f"Status Code: {res.status_code}")
    print(f"Response Body: {res.text}")

except Exception as e:
    print(f"Test script failed: {e}")
