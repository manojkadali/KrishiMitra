Project Overview: KrishiMitra - Smart Crop Advisory System
KrishiMitra is a comprehensive agricultural decision-support platform designed to help farmers make data-driven decisions about crop management, disease detection, and market prices.
Architecture
The project follows a microservices architecture with 4 main components:
1.	Frontend (React + Vite)
o	Location: client
o	Tech: React, Tailwind CSS, i18n (multilingual support)
o	Features: Authentication, Dashboard, Disease Detection UI, Market Prices UI
o	Routes: Login, Register, Dashboard, Disease Detection, Market Prices
2.	Backend (Node.js/Express)
o	Location: server
o	Tech: Express, PostgreSQL database, JWT authentication
o	Security: CORS, Helmet, Rate limiting (100 requests/15min)
o	Key modules:
1.	Authentication (Register, Login, JWT + role-based access)
2.	Farm Management (CRUD operations for farmer profiles & farms)
3.	Advisory Engine (Rule-based logic for crop recommendations)
4.	Weather Service (Real-time data from OpenWeather API with caching)
5.	Market Service (Commodity prices via Agmarknet)
6.	ML Integration (Disease detection calls)
3.	ML Service (FastAPI + TensorFlow)
o	Location: ml_service
o	Tech: FastAPI, Keras/TensorFlow
o	Purpose: Plant disease detection using a custom Keras model
o	Model: plant_disease_model.h5 with class mappings
o	Containerized in Docker
4.	Crop Advisory API (Python/FastAPI)
o	Location: crop_api
o	Tech: FastAPI, Scikit-learn
o	Purpose: ML-based crop recommendation using NPK, temperature, humidity, pH, rainfall
Database Schema (PostgreSQL)
•	users: Farmer/Admin accounts with JWT authentication
•	farms: Farm details (location, crop, soil properties, sowing date)
•	advisories: Generated recommendations with weather snapshots
•	disease_reports: Disease detection results with confidence scores
•	market_prices: Commodity prices by state/district
Key Features
✅ User authentication with role-based access
✅ Farm profile management (50+ fields including location, soil type, crop info)
✅ Real-time weather integration
✅ Rule-based advisory engine (evaluates 50+ rules based on weather & farm conditions)
✅ AI-powered plant disease detection (image upload → disease classification)
✅ Market price tracking by commodity, state, and district
✅ Multilingual UI (i18next)
✅ Voice input support (Web Speech API)
✅ Security hardening (rate limiting, helmet, input validation)

