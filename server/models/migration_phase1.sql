-- Phase 1 Migration: New features (Crop Recommendation, Irrigation, Pest Alerts, Yield, Price Forecast, Farm Map)

-- Crop Recommendations history
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    nitrogen NUMERIC,
    phosphorous NUMERIC,
    potassium NUMERIC,
    temperature NUMERIC,
    humidity NUMERIC,
    ph NUMERIC,
    rainfall NUMERIC,
    recommended_crops JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Irrigation schedules
CREATE TABLE IF NOT EXISTS irrigation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    soil_type VARCHAR(100) NOT NULL,
    irrigation_type VARCHAR(100),
    sowing_date DATE,
    schedule JSONB NOT NULL,
    next_irrigation DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pest alerts
CREATE TABLE IF NOT EXISTS pest_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    pest_disease VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    weather_snapshot JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Yield predictions
CREATE TABLE IF NOT EXISTS yield_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    crop VARCHAR(100) NOT NULL,
    area_acres NUMERIC NOT NULL,
    sowing_date DATE,
    predicted_yield_kg NUMERIC NOT NULL,
    yield_per_acre NUMERIC NOT NULL,
    harvest_window_start DATE,
    harvest_window_end DATE,
    confidence VARCHAR(20) NOT NULL,
    factors JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Market price history (for trend/forecast)
CREATE TABLE IF NOT EXISTS market_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    modal_price NUMERIC NOT NULL,
    min_price NUMERIC,
    max_price NUMERIC,
    recorded_at DATE DEFAULT CURRENT_DATE
);

-- Simplified advisories table (was implicit, ensure it exists)
CREATE TABLE IF NOT EXISTS simplified_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nitrogen NUMERIC,
    phosphorous NUMERIC,
    potassium NUMERIC,
    temperature NUMERIC,
    humidity NUMERIC,
    ph NUMERIC,
    rainfall NUMERIC,
    crop_recommendation TEXT,
    fertilizer_advice TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
