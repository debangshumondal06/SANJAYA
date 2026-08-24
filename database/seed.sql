INSERT INTO departments (code, name, description) VALUES
('ROADS', 'Roads & Public Works', 'Road-surface failures, footpaths, crossings, and road safety.'),
('SANITATION', 'Sanitation Services', 'Waste collection, overflow, street cleanliness, and debris removal.'),
('DRAINAGE', 'Drainage & Stormwater', 'Waterlogging, blocked drains, and stormwater response.');

INSERT INTO incidents (
    category, description, latitude, longitude, ward, severity,
    priority_score, priority_label, priority_explanation, status, department_id
) VALUES
(
    'pothole',
    'Large pothole at the school crossing; traffic is swerving around the damaged road surface.',
    19.06325, 72.85110, 'Ward 07', 'high', 84, 'Critical',
    '["Pothole base risk", "High reported severity", "School and traffic exposure"]',
    'assigned', 1
),
(
    'waterlogging',
    'Standing water is blocking the lane and a nearby storm drain appears obstructed.',
    19.05782, 72.84835, 'Ward 05', 'high', 76, 'High',
    '["Waterlogging base risk", "High reported severity", "Drainage indicator"]',
    'in_progress', 3
),
(
    'garbage_overflow',
    'Overflowing public bin is blocking the footpath near the local market.',
    19.07015, 72.85680, 'Ward 09', 'medium', 62, 'Medium',
    '["Garbage-overflow base risk", "Pedestrian and market exposure"]',
    'submitted', 2
);