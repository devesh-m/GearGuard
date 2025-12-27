-- Clear existing data (optional, be careful in production)
-- TRUNCATE TABLE maintenance_requests, equipment, work_centers, equipment_categories, team_members, teams, companies, users CASCADE;

-- 1. Companies
INSERT INTO companies (name, address) VALUES 
('My Company (San Francisco)', '123 Tech Blvd, San Francisco, CA'),
('My Company (New York)', '456 Empire St, New York, NY');

-- 2. Users
-- Password hash is for 'password123' using bcrypt
INSERT INTO users (name, email, password_hash, role, company_id) VALUES 
('Tejas Modi', 'tejas@example.com', '$2b$10$rQZ5FzMH3DPR0Q.vZDh2eO7M0yz7h8lFIhCPR8dT0U3Y5z1j6P.e6', 'admin', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)')),
('Bhaumik P', 'bhaumik@example.com', '$2b$10$rQZ5FzMH3DPR0Q.vZDh2eO7M0yz7h8lFIhCPR8dT0U3Y5z1j6P.e6', 'technician', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)')),
('Mitchell Admin', 'mitchell@example.com', '$2b$10$rQZ5FzMH3DPR0Q.vZDh2eO7M0yz7h8lFIhCPR8dT0U3Y5z1j6P.e6', 'admin', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)')),
('Marc Demo', 'marc@example.com', '$2b$10$rQZ5FzMH3DPR0Q.vZDh2eO7M0yz7h8lFIhCPR8dT0U3Y5z1j6P.e6', 'technician', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)')),
('Sarah Tech', 'sarah@example.com', '$2b$10$rQZ5FzMH3DPR0Q.vZDh2eO7M0yz7h8lFIhCPR8dT0U3Y5z1j6P.e6', 'technician', (SELECT id FROM companies WHERE name = 'My Company (New York)')),
('John User', 'john@example.com', '$2b$10$rQZ5FzMH3DPR0Q.vZDh2eO7M0yz7h8lFIhCPR8dT0U3Y5z1j6P.e6', 'portal_user', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'));

-- 3. Teams
INSERT INTO teams (name, company_id) VALUES 
('Maintenance Team A', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)')),
('IT Support Team', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)')),
('Facilities Team', (SELECT id FROM companies WHERE name = 'My Company (New York)'));

-- 4. Team Members
INSERT INTO team_members (team_id, user_id) VALUES 
((SELECT id FROM teams WHERE name = 'Maintenance Team A'), (SELECT id FROM users WHERE email = 'bhaumik@example.com')),
((SELECT id FROM teams WHERE name = 'Maintenance Team A'), (SELECT id FROM users WHERE email = 'marc@example.com')),
((SELECT id FROM teams WHERE name = 'IT Support Team'), (SELECT id FROM users WHERE email = 'tejas@example.com')),
((SELECT id FROM teams WHERE name = 'IT Support Team'), (SELECT id FROM users WHERE email = 'mitchell@example.com')),
((SELECT id FROM teams WHERE name = 'Facilities Team'), (SELECT id FROM users WHERE email = 'sarah@example.com'));

-- 5. Equipment Categories (with team_id)
INSERT INTO equipment_categories (name, responsible_user_id, company_id, team_id) VALUES 
('Monitors', (SELECT id FROM users WHERE email = 'mitchell@example.com'), (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), (SELECT id FROM teams WHERE name = 'IT Support Team')),
('Computers', (SELECT id FROM users WHERE email = 'mitchell@example.com'), (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), (SELECT id FROM teams WHERE name = 'IT Support Team')),
('Drills', (SELECT id FROM users WHERE email = 'marc@example.com'), (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), (SELECT id FROM teams WHERE name = 'Maintenance Team A')),
('HVAC Systems', (SELECT id FROM users WHERE email = 'sarah@example.com'), (SELECT id FROM companies WHERE name = 'My Company (New York)'), (SELECT id FROM teams WHERE name = 'Facilities Team'));

-- 6. Work Centers
INSERT INTO work_centers (name, code, tag, cost_per_hour, capacity, oee_target, time_efficiency) VALUES 
('Assembly Line 1', 'WC-001', 'ASM-1', 150.00, 100, 85.0, 1.0);

INSERT INTO work_centers (name, code, tag, cost_per_hour, capacity, oee_target, alternative_work_center_id, time_efficiency) VALUES 
('Assembly Line 2 (Backup)', 'WC-002', 'ASM-2', 120.00, 80, 80.0, (SELECT id FROM work_centers WHERE code = 'WC-001'), 0.9);

INSERT INTO work_centers (name, code, tag, cost_per_hour, capacity, oee_target, time_efficiency) VALUES 
('Packaging Station', 'WC-003', 'PKG-1', 80.00, 50, 90.0, 1.0);

-- 7. Equipment (with purchase_date and warranty_expiry)
INSERT INTO equipment (
    name, serial_number, category_id, technician_id, assigned_to_user_id, 
    department, work_center_id, location, company_id, health_status,
    purchase_date, warranty_expiry, is_scrapped
) VALUES 
(
    'Samsung Monitor 27"', 'MT/125/22778837', 
    (SELECT id FROM equipment_categories WHERE name = 'Monitors'), 
    (SELECT id FROM users WHERE email = 'mitchell@example.com'), 
    (SELECT id FROM users WHERE email = 'tejas@example.com'), 
    'Admin', (SELECT id FROM work_centers WHERE code = 'WC-001'), 
    'Office 101', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    95, '2023-01-15', '2026-01-15', FALSE
),
(
    'Dell Monitor 24"', 'MT/126/33445566', 
    (SELECT id FROM equipment_categories WHERE name = 'Monitors'), 
    (SELECT id FROM users WHERE email = 'mitchell@example.com'), 
    (SELECT id FROM users WHERE email = 'john@example.com'), 
    'Sales', NULL, 
    'Office 205', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    25, '2020-06-10', '2023-06-10', FALSE
),
(
    'Acer Laptop Pro', 'LT/122/11112222', 
    (SELECT id FROM equipment_categories WHERE name = 'Computers'), 
    (SELECT id FROM users WHERE email = 'marc@example.com'), 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    'Technician', (SELECT id FROM work_centers WHERE code = 'WC-002'), 
    'Workshop', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    88, '2022-03-20', '2025-03-20', FALSE
),
(
    'HP Desktop', 'DT/200/99887766', 
    (SELECT id FROM equipment_categories WHERE name = 'Computers'), 
    (SELECT id FROM users WHERE email = 'mitchell@example.com'), 
    (SELECT id FROM users WHERE email = 'tejas@example.com'), 
    'Admin', (SELECT id FROM work_centers WHERE code = 'WC-001'), 
    'Office 101', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    100, '2024-01-01', '2027-01-01', FALSE
),
(
    'Industrial Drill X500', 'DR/500/77889900', 
    (SELECT id FROM equipment_categories WHERE name = 'Drills'), 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    NULL, 
    'Manufacturing', (SELECT id FROM work_centers WHERE code = 'WC-001'), 
    'Assembly Floor', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    72, '2021-09-15', '2024-09-15', FALSE
),
(
    'Old Broken Drill', 'DR/100/11223344', 
    (SELECT id FROM equipment_categories WHERE name = 'Drills'), 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    NULL, 
    'Manufacturing', NULL, 
    'Storage', (SELECT id FROM companies WHERE name = 'My Company (San Francisco)'), 
    0, '2018-01-01', '2021-01-01', TRUE
);

-- 8. Maintenance Requests (with scheduled_date and duration)
INSERT INTO maintenance_requests (
    subject, created_by_id, maintenance_for, resource_id, type, 
    team_id, technician_id, scheduled_date, duration, priority, status, instructions, notes
) VALUES 
(
    'Monitor flickering issue', 
    (SELECT id FROM users WHERE email = 'tejas@example.com'), 
    'equipment', 
    (SELECT id FROM equipment WHERE serial_number = 'MT/125/22778837'), 
    'corrective', 
    (SELECT id FROM teams WHERE name = 'IT Support Team'), 
    (SELECT id FROM users WHERE email = 'mitchell@example.com'), 
    '2025-12-28 10:00:00', 2.0,
    'medium', 'new', 
    'Check HDMI cable and power supply. Test with different cable.',
    'User reports intermittent flickering during morning hours.'
),
(
    'Monthly Calibration - Assembly Line', 
    (SELECT id FROM users WHERE email = 'marc@example.com'), 
    'work_center', 
    (SELECT id FROM work_centers WHERE code = 'WC-001'), 
    'preventive', 
    (SELECT id FROM teams WHERE name = 'Maintenance Team A'), 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    '2025-12-30 08:00:00', 4.0,
    'high', 'in_progress', 
    'Calibrate sensors and check belt tension. Document all readings.',
    'Scheduled monthly preventive maintenance.'
),
(
    'Laptop battery replacement', 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    'equipment', 
    (SELECT id FROM equipment WHERE serial_number = 'LT/122/11112222'), 
    'corrective', 
    (SELECT id FROM teams WHERE name = 'IT Support Team'), 
    (SELECT id FROM users WHERE email = 'marc@example.com'), 
    '2025-12-20 14:00:00', 1.0,
    'low', 'repaired', 
    'Replace battery with new OEM part.',
    'Completed on schedule. Battery replaced successfully.'
),
(
    'Critical drill motor failure', 
    (SELECT id FROM users WHERE email = 'marc@example.com'), 
    'equipment', 
    (SELECT id FROM equipment WHERE serial_number = 'DR/500/77889900'), 
    'corrective', 
    (SELECT id FROM teams WHERE name = 'Maintenance Team A'), 
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'), 
    '2025-12-25 09:00:00', 3.0,
    'critical', 'new', 
    'Motor making grinding noise. Stop use immediately.',
    'Production line affected. Urgent repair needed.'
),
(
    'Dell Monitor - Screen dead', 
    (SELECT id FROM users WHERE email = 'john@example.com'), 
    'equipment', 
    (SELECT id FROM equipment WHERE serial_number = 'MT/126/33445566'), 
    'corrective', 
    (SELECT id FROM teams WHERE name = 'IT Support Team'), 
    (SELECT id FROM users WHERE email = 'mitchell@example.com'), 
    '2025-12-22 11:00:00', 1.5,
    'high', 'in_progress', 
    'Screen not turning on. Check power board.',
    'Warranty expired. May need replacement.'
),
(
    'Quarterly HVAC inspection', 
    (SELECT id FROM users WHERE email = 'sarah@example.com'), 
    'work_center', 
    (SELECT id FROM work_centers WHERE code = 'WC-003'), 
    'preventive', 
    (SELECT id FROM teams WHERE name = 'Facilities Team'), 
    (SELECT id FROM users WHERE email = 'sarah@example.com'), 
    '2026-01-05 09:00:00', 6.0,
    'medium', 'new', 
    'Full HVAC system inspection and filter replacement.',
    NULL
);

-- 9. Worksheet Comments (sample work logs)
INSERT INTO worksheet_comments (request_id, user_id, comment, hours_logged) VALUES
(
    (SELECT id FROM maintenance_requests WHERE subject = 'Monthly Calibration - Assembly Line'),
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'),
    'Started calibration process. Belt tension checked and adjusted.',
    1.5
),
(
    (SELECT id FROM maintenance_requests WHERE subject = 'Monthly Calibration - Assembly Line'),
    (SELECT id FROM users WHERE email = 'bhaumik@example.com'),
    'Sensor readings documented. Minor adjustment needed on station 3.',
    1.0
),
(
    (SELECT id FROM maintenance_requests WHERE subject = 'Dell Monitor - Screen dead'),
    (SELECT id FROM users WHERE email = 'mitchell@example.com'),
    'Tested power supply - working fine. Issue is with the display panel.',
    0.5
),
(
    (SELECT id FROM maintenance_requests WHERE subject = 'Laptop battery replacement'),
    (SELECT id FROM users WHERE email = 'marc@example.com'),
    'Battery replaced successfully. Tested for 2 hours - holding charge.',
    1.0
);
