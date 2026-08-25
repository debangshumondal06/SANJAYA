INSERT OR IGNORE INTO departments (id, code, name, description) VALUES
  (1, 'ROADS', 'Roads & Public Works', 'Road-surface failures, footpaths, crossings, and road safety.'),
  (2, 'SANITATION', 'Sanitation Services', 'Waste collection, overflow, street cleanliness, and debris removal.'),
  (3, 'DRAINAGE', 'Drainage & Stormwater', 'Waterlogging, blocked drains, and stormwater response.'),
  (4, 'ELECTRICAL', 'Electrical Maintenance', 'Streetlights and municipal public assets.'),
  (5, 'REVENUE', 'Tehsildar / Revenue Administration', 'Revenue records and jurisdiction review.');

INSERT OR IGNORE INTO members (member_id, display_name, department, access_role, is_active) VALUES
  ('SNY-MUN-1001', 'Neha Rao', 'Municipal Operations', 'duty_officer', 1),
  ('SNY-REV-2004', 'Arjun Mehta', 'Tehsildar / Revenue Administration', 'routing_officer', 1),
  ('SNY-SAN-3012', 'Farah Khan', 'Sanitation & Solid Waste', 'department_officer', 1),
  ('SNY-OLD-0099', 'Inactive Member', 'Municipal Operations', 'duty_officer', 0);

INSERT INTO incidents (
  category, description, latitude, longitude, ward, severity,
  priority_score, priority_label, priority_explanation, status, department_id
) VALUES
  ('pothole', 'Large pothole at the school crossing; traffic is swerving around the damaged road surface.', 19.06325, 72.85110, 'Ward 07', 'high', 84, 'High', '["Pothole base risk", "High reported severity", "School and traffic exposure"]', 'assigned', 1),
  ('waterlogging', 'Standing water is blocking the lane and a nearby storm drain appears obstructed.', 19.05782, 72.84835, 'Ward 05', 'high', 76, 'High', '["Waterlogging base risk", "High reported severity", "Drainage indicator"]', 'in_progress', 3),
  ('garbage_overflow', 'Overflowing public bin is blocking the footpath near the local market.', 19.07015, 72.85680, 'Ward 09', 'medium', 62, 'Medium', '["Garbage-overflow base risk", "Pedestrian and market exposure"]', 'submitted', 2);

INSERT INTO incident_updates (incident_id, previous_status, new_status, note, updated_by) VALUES
  (1, NULL, 'assigned', 'Roads team assigned after priority review.', 'Neha Rao'),
  (2, NULL, 'in_progress', 'Drainage field assessment is in progress.', 'Farah Khan'),
  (3, NULL, 'submitted', 'Citizen report received.', 'Citizen');