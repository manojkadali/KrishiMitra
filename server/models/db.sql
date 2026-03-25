-- Run this script in PostgreSQL to create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    area_acres NUMERIC NOT NULL CHECK (area_acres > 0),
    soil_type VARCHAR(100) NOT NULL,
    current_crop VARCHAR(100) NOT NULL,
    soil_ph NUMERIC CHECK (soil_ph BETWEEN 3 AND 9),
    irrigation_type VARCHAR(100),
    sowing_date DATE,
    previous_crop VARCHAR(100),
    latitude NUMERIC,
    longitude NUMERIC,
    district VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    weather_snapshot JSONB,
    rules_triggered JSONB,
    advisories_given JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disease_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    image_url VARCHAR(1000),
    predicted_disease VARCHAR(255),
    confidence NUMERIC,
    treatment TEXT,
    low_confidence BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    market VARCHAR(100),
    min_price NUMERIC,
    max_price NUMERIC,
    modal_price NUMERIC,
    fetched_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(commodity, state, district, fetched_at)
);

