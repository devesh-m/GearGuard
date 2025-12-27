CREATE DATABASE gearguard;

-- Connect to the database
\c gearguard;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TYPE user_role AS ENUM ('admin', 'technician', 'portal_user');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'portal_user',
    company_id UUID, -- Placeholder for now, will link to companies table later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255)
);

-- Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES companies(id)
);

-- Team Members (Junction Table)
CREATE TABLE IF NOT EXISTS team_members (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, user_id)
);

-- Equipment Categories
CREATE TABLE IF NOT EXISTS equipment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    responsible_user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id)
);

-- Work Centers
CREATE TABLE IF NOT EXISTS work_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    tag VARCHAR(50),
    cost_per_hour DECIMAL(10, 2),
    capacity INTEGER,
    oee_target DECIMAL(5, 2),
    alternative_work_center_id UUID REFERENCES work_centers(id),
    time_efficiency DECIMAL(5, 2)
);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255),
    category_id UUID REFERENCES equipment_categories(id),
    technician_id UUID REFERENCES users(id),
    assigned_to_user_id UUID REFERENCES users(id),
    department VARCHAR(255),
    work_center_id UUID REFERENCES work_centers(id),
    location VARCHAR(255),
    company_id UUID REFERENCES companies(id),
    health_status INTEGER DEFAULT 100 CHECK (health_status >= 0 AND health_status <= 100)
);

-- Maintenance Requests
CREATE TYPE request_type AS ENUM ('corrective', 'preventive');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE request_status AS ENUM ('new', 'in_progress', 'repaired', 'scrap');
CREATE TYPE maintenance_for_type AS ENUM ('equipment', 'work_center');

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL,
    created_by_id UUID REFERENCES users(id),
    maintenance_for maintenance_for_type NOT NULL,
    resource_id UUID NOT NULL, -- Polymorphic ID
    request_date DATE DEFAULT CURRENT_DATE,
    type request_type,
    team_id UUID REFERENCES teams(id),
    technician_id UUID REFERENCES users(id),
    scheduled_date TIMESTAMP,
    duration FLOAT,
    priority request_priority DEFAULT 'medium',
    status request_status DEFAULT 'new',
    instructions TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
