-- TRAINS
INSERT INTO trains (train_no, name, from_station, to_station, platform, status, arrival_time, delay_minutes) VALUES
('12301', 'Rajdhani Express', 'New Delhi', 'Howrah', 3, 'On Time', '14:45:00', 0),
('12001', 'Shatabdi Express', 'New Delhi', 'Mumbai', 7, 'Delayed', '09:45:00', 30),
('12951', 'Mumbai Rajdhani', 'New Delhi', 'Mumbai Central', 1, 'On Time', '17:30:00', 0),
('12259', 'Duronto Express', 'New Delhi', 'Sealdah', 5, 'On Time', '20:15:00', 0),
('12555', 'Gorakhdham Express', 'Anand Vihar', 'Gorakhpur', 2, 'Delayed', '11:30:00', 45)
ON CONFLICT (train_no) DO NOTHING;

-- PRICE TIERS
INSERT INTO price_tiers (size, label, base_price, max_discount, floor_price) VALUES
('small', 'Small (1-2 bags)', 50, 10, 40),
('medium', 'Medium (3-4 bags)', 100, 20, 80),
('large', 'Large (5+ bags)', 150, 20, 130),
('heavy', 'Very Heavy / Trolley', 200, 20, 180)
ON CONFLICT (size) DO NOTHING;

-- FESTIVAL SURGES
INSERT INTO festival_surges (festival_name, surge_percentage, is_active) VALUES
('Diwali', 30, true),
('Holi', 25, false),
('Dussehra', 20, false),
('Exam Season', 15, false),
('Summer Rush', 20, true)
ON CONFLICT (festival_name) DO NOTHING;

-- BUSY HOURS (Just inserting Mon-Sun 0-23 with random realistic data derived from the mock)
INSERT INTO busy_hours (day_of_week, hour_of_day, busy_level) VALUES
(0, 0, 1), (0, 1, 1), (0, 2, 0), (0, 3, 0), (0, 4, 0), (0, 5, 1), (0, 6, 2), (0, 7, 3), (0, 8, 3), (0, 9, 2), (0, 10, 2), (0, 11, 2), (0, 12, 2), (0, 13, 3), (0, 14, 3), (0, 15, 2), (0, 16, 2), (0, 17, 3), (0, 18, 4), (0, 19, 3), (0, 20, 2), (0, 21, 2), (0, 22, 1), (0, 23, 1),
(1, 0, 1), (1, 1, 0), (1, 2, 0), (1, 3, 0), (1, 4, 0), (1, 5, 1), (1, 6, 2), (1, 7, 3), (1, 8, 3), (1, 9, 2), (1, 10, 2), (1, 11, 2), (1, 12, 2), (1, 13, 3), (1, 14, 3), (1, 15, 2), (1, 16, 2), (1, 17, 3), (1, 18, 4), (1, 19, 3), (1, 20, 2), (1, 21, 2), (1, 22, 1), (1, 23, 1),
(2, 0, 1), (2, 1, 0), (2, 2, 0), (2, 3, 0), (2, 4, 0), (2, 5, 1), (2, 6, 2), (2, 7, 3), (2, 8, 2), (2, 9, 2), (2, 10, 2), (2, 11, 2), (2, 12, 2), (2, 13, 3), (2, 14, 3), (2, 15, 2), (2, 16, 3), (2, 17, 3), (2, 18, 4), (2, 19, 3), (2, 20, 2), (2, 21, 2), (2, 22, 1), (2, 23, 1),
(3, 0, 1), (3, 1, 0), (3, 2, 0), (3, 3, 0), (3, 4, 0), (3, 5, 1), (3, 6, 2), (3, 7, 4), (3, 8, 3), (3, 9, 2), (3, 10, 2), (3, 11, 2), (3, 12, 3), (3, 13, 4), (3, 14, 3), (3, 15, 2), (3, 16, 3), (3, 17, 4), (3, 18, 4), (3, 19, 3), (3, 20, 2), (3, 21, 2), (3, 22, 2), (3, 23, 1),
(4, 0, 1), (4, 1, 0), (4, 2, 0), (4, 3, 0), (4, 4, 0), (4, 5, 1), (4, 6, 2), (4, 7, 3), (4, 8, 3), (4, 9, 2), (4, 10, 2), (4, 11, 2), (4, 12, 3), (4, 13, 4), (4, 14, 3), (4, 15, 2), (4, 16, 3), (4, 17, 4), (4, 18, 4), (4, 19, 3), (4, 20, 2), (4, 21, 2), (4, 22, 2), (4, 23, 1),
(5, 0, 2), (5, 1, 1), (5, 2, 0), (5, 3, 0), (5, 4, 0), (5, 5, 1), (5, 6, 2), (5, 7, 3), (5, 8, 3), (5, 9, 3), (5, 10, 3), (5, 11, 4), (5, 12, 4), (5, 13, 4), (5, 14, 3), (5, 15, 3), (5, 16, 3), (5, 17, 4), (5, 18, 4), (5, 19, 4), (5, 20, 3), (5, 21, 2), (5, 22, 2), (5, 23, 1),
(6, 0, 2), (6, 1, 1), (6, 2, 0), (6, 3, 0), (6, 4, 0), (6, 5, 1), (6, 6, 2), (6, 7, 3), (6, 8, 2), (6, 9, 3), (6, 10, 3), (6, 11, 4), (6, 12, 4), (6, 13, 4), (6, 14, 3), (6, 15, 3), (6, 16, 3), (6, 17, 3), (6, 18, 3), (6, 19, 3), (6, 20, 2), (6, 21, 2), (6, 22, 2), (6, 23, 1)
ON CONFLICT DO NOTHING;
