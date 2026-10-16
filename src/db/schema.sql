-- PostgreSQL Database Schema for TroutStream RAS (Rainbow Trout Farm Manager)
-- Normalized relational schema with strict constraints, foreign keys, and indexes.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'manager', 'operator', 'biologist', 'viewer')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms Table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    location VARCHAR(255),
    species VARCHAR(150) DEFAULT 'Oncorhynchus mykiss',
    total_water_volume_m3 NUMERIC(10, 2) NOT NULL DEFAULT 100.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tanks Table
CREATE TABLE tanks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    tank_type VARCHAR(50) NOT NULL CHECK (tank_type IN ('circular', 'd_ended', 'raceway', 'nursery_tray')),
    volume_m3 NUMERIC(8, 2) NOT NULL CHECK (volume_m3 > 0),
    diameter_m NUMERIC(6, 2),
    depth_m NUMERIC(6, 2),
    fish_count INTEGER NOT NULL DEFAULT 0 CHECK (fish_count >= 0),
    avg_weight_g NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (avg_weight_g >= 0),
    stocking_date DATE,
    target_harvest_weight_g NUMERIC(8, 2) DEFAULT 450.0,
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'quarantine', 'cleaning', 'fallow')),
    water_loop_id VARCHAR(50) DEFAULT 'loop-1',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tanks_farm ON tanks(farm_id);
CREATE INDEX idx_tanks_status ON tanks(status);

-- 4. Alert Thresholds
CREATE TABLE alert_thresholds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    temp_min_c NUMERIC(4, 1) DEFAULT 12.0,
    temp_max_c NUMERIC(4, 1) DEFAULT 16.5,
    do_min_mgl NUMERIC(4, 1) DEFAULT 6.5,
    do_optimal_mgl NUMERIC(4, 1) DEFAULT 8.5,
    ph_min NUMERIC(4, 2) DEFAULT 6.8,
    ph_max NUMERIC(4, 2) DEFAULT 7.8,
    tan_max_mgl NUMERIC(5, 3) DEFAULT 0.80,
    unionized_ammonia_max_mgl NUMERIC(6, 4) DEFAULT 0.015,
    nitrite_max_mgl NUMERIC(5, 3) DEFAULT 0.15,
    nitrate_max_mgl NUMERIC(5, 1) DEFAULT 60.0,
    co2_max_mgl NUMERIC(5, 2) DEFAULT 12.0,
    alkalinity_min_mgl NUMERIC(6, 1) DEFAULT 90.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Water Quality Readings
CREATE TABLE water_quality_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    tank_id UUID REFERENCES tanks(id) ON DELETE SET NULL,
    water_loop_id VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    temperature_c NUMERIC(5, 2) NOT NULL,
    dissolved_oxygen_mgl NUMERIC(5, 2) NOT NULL,
    ph NUMERIC(4, 2) NOT NULL,
    tan_mgl NUMERIC(6, 3) NOT NULL,
    unionized_ammonia_mgl NUMERIC(7, 4) NOT NULL,
    nitrite_mgl NUMERIC(6, 3) NOT NULL,
    nitrate_mgl NUMERIC(6, 2) NOT NULL,
    alkalinity_mgl NUMERIC(6, 2) NOT NULL,
    co2_mgl NUMERIC(5, 2) NOT NULL,
    flow_rate_m3h NUMERIC(8, 2),
    water_level_pct NUMERIC(5, 2),
    operator VARCHAR(100) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_water_quality_farm_date ON water_quality_readings(farm_id, recorded_at DESC);
CREATE INDEX idx_water_quality_tank ON water_quality_readings(tank_id);

-- 6. Feed Products
CREATE TABLE feed_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    pellet_size_mm NUMERIC(4, 1) NOT NULL,
    protein_pct NUMERIC(4, 1) NOT NULL,
    fat_pct NUMERIC(4, 1) NOT NULL,
    unit_price_per_kg NUMERIC(8, 2) NOT NULL,
    stock_remaining_kg NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Feed Records
CREATE TABLE feed_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    feed_product_id UUID REFERENCES feed_products(id) ON DELETE SET NULL,
    recorded_at TIMESTAMPTZ NOT NULL,
    quantity_kg NUMERIC(8, 2) NOT NULL CHECK (quantity_kg > 0),
    sessions_count INTEGER DEFAULT 3 CHECK (sessions_count > 0),
    feeding_method VARCHAR(50) DEFAULT 'automatic_feeder',
    batch_number VARCHAR(100),
    operator VARCHAR(100) NOT NULL,
    appetite_rating VARCHAR(30) CHECK (appetite_rating IN ('poor', 'moderate', 'good', 'aggressive')),
    cost_estimate NUMERIC(8, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_feed_records_tank_date ON feed_records(tank_id, recorded_at DESC);

-- 8. Fish Stock Movements (Permanent audit log for transfers, mortality, grading, harvest)
CREATE TABLE fish_stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('initial_stock', 'arrival', 'transfer', 'mortality', 'cull', 'harvest')),
    source_tank_id UUID REFERENCES tanks(id) ON DELETE SET NULL,
    dest_tank_id UUID REFERENCES tanks(id) ON DELETE SET NULL,
    fish_count INTEGER NOT NULL CHECK (fish_count > 0),
    avg_weight_g NUMERIC(8, 2) NOT NULL,
    biomass_kg NUMERIC(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    operator VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_movements_farm_date ON fish_stock_movements(farm_id, created_at DESC);

-- 9. Fish Sampling Records
CREATE TABLE fish_sampling_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    sampled_at DATE NOT NULL,
    sampled_count INTEGER NOT NULL CHECK (sampled_count > 0),
    avg_weight_g NUMERIC(8, 2) NOT NULL CHECK (avg_weight_g > 0),
    min_weight_g NUMERIC(8, 2),
    max_weight_g NUMERIC(8, 2),
    avg_length_cm NUMERIC(6, 2),
    condition_factor_k NUMERIC(5, 2),
    sgr_pct_day NUMERIC(5, 2),
    adg_grams_day NUMERIC(6, 2),
    estimated_biomass_kg NUMERIC(10, 2),
    days_to_target_harvest INTEGER,
    operator VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_sampling_tank_date ON fish_sampling_records(tank_id, sampled_at DESC);

-- 10. Mortality and Health Records
CREATE TABLE mortality_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    tank_id UUID NOT NULL REFERENCES tanks(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    dead_count INTEGER NOT NULL CHECK (dead_count > 0),
    suspected_cause VARCHAR(255) NOT NULL,
    symptoms TEXT[],
    behavior_notes TEXT,
    treatment_taken TEXT,
    medication_used VARCHAR(150),
    dosage VARCHAR(100),
    operator VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_mortality_tank_date ON mortality_records(tank_id, recorded_at DESC);

-- 11. Equipment Register
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('pump', 'drum_filter', 'mbbr', 'aeration', 'oxygen_cone', 'degasser', 'uv', 'chiller', 'generator', 'sensor')),
    location VARCHAR(100),
    status VARCHAR(30) DEFAULT 'running' CHECK (status IN ('running', 'warning', 'maintenance', 'offline')),
    power_kw NUMERIC(6, 2),
    installation_date DATE,
    last_service_date DATE,
    next_service_due DATE,
    run_hours NUMERIC(10, 1) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Maintenance Records
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('routine_inspection', 'cleaning', 'backwash', 'part_replacement', 'emergency_repair')),
    description TEXT NOT NULL,
    parts_replaced TEXT,
    cost NUMERIC(10, 2) DEFAULT 0.00,
    operator VARCHAR(100) NOT NULL,
    next_due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Resource Usage (Water, Electricity, Oxygen)
CREATE TABLE resource_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    freshwater_added_m3 NUMERIC(8, 2) DEFAULT 0,
    water_discharged_m3 NUMERIC(8, 2) DEFAULT 0,
    electricity_kwh NUMERIC(10, 2) DEFAULT 0,
    liquid_oxygen_kg NUMERIC(8, 2) DEFAULT 0,
    daily_cost NUMERIC(8, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Inventory Items & Stock
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('feed', 'oxygen', 'chemicals', 'spare_parts', 'testing')),
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(30) NOT NULL,
    min_threshold NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(8, 2) NOT NULL DEFAULT 0,
    supplier VARCHAR(150),
    last_restocked DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('feed', 'fingerlings', 'electricity', 'oxygen', 'water', 'labor', 'maintenance', 'supplies')),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    vendor VARCHAR(150),
    payment_method VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Activity Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    operator VARCHAR(100) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('water', 'feed', 'stock', 'equipment', 'system')),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'danger'))
);
CREATE INDEX idx_activity_farm_date ON activity_logs(farm_id, created_at DESC);
