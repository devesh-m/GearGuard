-- Clear existing data (optional, be careful in production)
-- TRUNCATE TABLE maintenance_requests, equipment, work_centers, equipment_categories, team_members, teams, companies, users CASCADE;

-- 1. Companies
INSERT INTO companies (name, address) VALUES 
('My Company (San Francisco)', '123 Tech Blvd, San Francisco, CA'),
('My Company (New York)', '456 Empire St, New York, NY');

-- 2. Users
-- Password hash is for 'password123' (example)
INSERT INTO users (name, email, password_hash, role) VALUES 
('Tejas Modi', 'tejas@example.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('Bhaumik P', 'bhaumik@example.com', '$2b$10$YourHashedPasswordHere', 'technician'),
('Mitchell Admin', 'mitchell@example.com', '$2b$10$YourHashedPasswordHere', 'admin'),
('Marc Demo', 'marc@example.com', '$2b$10$YourHashedPasswordHere', 'technician');

-- 3. Teams
INSERT INTO teams (name, company_id) VALUES 
('Maintenance Team A', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)')),
('IT Support Team', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'));

-- 4. Team Members
INSERT INTO team_members (team_id, user_id) VALUES 
((SELECT id FROM teams WHERE name = 'Maintenance Team A'), (SELECT id FROM users WHERE email = 'bhaumik@example.com')),
((SELECT id FROM teams WHERE name = 'Maintenance Team A'), (SELECT id FROM users WHERE email = 'marc@example.com')),
((SELECT id FROM teams WHERE name = 'IT Support Team'), (SELECT id FROM users WHERE email = 'tejas@example.com'));

-- 5. Equipment Categories
INSERT INTO equipment_categories (name, responsible_user_id) VALUES 
('Monitors', (SELECT id FROM users WHERE email = 'mitchell@example.com')),
('Computers', (SELECT id FROM users WHERE email = 'mitchell@example.com')),
('Drills', (SELECT id FROM users WHERE email = 'marc@example.com'));

-- 6. Work Centers
-- Insert Main Work Center first
INSERT INTO work_centers (name, code, tag, cost_per_hour, capacity, oee_target, time_efficiency) VALUES 
('Assembly Line 1', 'WC-001', 'ASM-1', 150.00, 100, 85.0, 1.0);

-- Insert Alternative Work Center (referencing the first one if needed, or just another one)
INSERT INTO work_centers (name, code, tag, cost_per_hour, capacity, oee_target, alternative_work_center_id, time_efficiency) VALUES 
('Assembly Line 2 (Backup)', 'WC-002', 'ASM-2', 120.00, 80, 80.0, (SELECT id FROM work_centers WHERE code = 'WC-001'), 0.9);

-- 7. Equipment
INSERT INTO equipment (
    name, 
    serial_number, 
    category_id, 
    technician_id, 
    assigned_to_user_id, 
    department, 
    work_center_id, 
    location, 
    company_id, 
    health_status
) VALUES 
(
    'Samsung Monitor 15"', 
    'MT/125/22778837', 
    (SELECT id FROM equipment_categories WHERE name = 'Monitors'), 
    (SELECT id FROM users WHERE email = 'mitchell@example.com'), 
    (SELECT id FROM users WHERE email = 'tejas@example.com'), 
    'Admin', 
    (SELECT id FROM work_centers WHERE code = 'WC-001'), 
    'Office 101', 
    (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    95
),
(
    'Acer Laptop', 
    'MT/122/11112222', 
    (SELECT id FROM equipment_categories WHERE name = 'Computers'), 
    (SELECT id FROM users WHERE email = 'marc@example.com'), 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    'Technician', 
    (SELECT id FROM work_centers WHERE code = 'WC-002'), 
    'Workshop', 
    (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    88
);

-- 8. Maintenance Requests
INSERT INTO maintenance_requests (
    subject, 
    created_by_id, 
    maintenance_for, 
    resource_id, 
    type, 
    team_id, 
    technician_id, 
    priority, 
    status, 
    instructions
) VALUES 
(
    'Monitor flickering', 
    (SELECT id FROM users WHERE email = 'tejas@example.com'), 
    'equipment', 
    (SELECT id FROM equipment WHERE name = 'Samsung Monitor 15"'), 
    'corrective', 
    (SELECT id FROM teams WHERE name = 'IT Support Team'), 
    (SELECT id FROM users WHERE email = 'mitchell@example.com'), 
    'medium', 
    'new', 
    'Check HDMI cable and power supply'
),
(
    'Monthly Calibration', 
    (SELECT id FROM users WHERE email = 'marc@example.com'), 
    'work_center', 
    (SELECT id FROM work_centers WHERE code = 'WC-001'), 
    'preventive', 
    (SELECT id FROM teams WHERE name = 'Maintenance Team A'), 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    'high', 
    'in_progress', 
    'Calibrate sensors and check belt tension'
);
