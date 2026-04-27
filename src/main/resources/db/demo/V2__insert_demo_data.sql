-- Demo data – only loaded in dev profile (not in tests)
INSERT INTO moment (name, type, target_date, start_time, description, color, created_at, updated_at)
VALUES
    ('Kreuzfahrt Mittelmeer', 'TARGET_DATE', '2026-08-15', NULL,
     'Große Mittelmeerreise mit der Familie', '#6366f1', NOW(), NOW()),

    ('Geburtstag 🎂', 'TARGET_DATE', '2026-10-31', NULL,
     NULL, '#ec4899', NOW(), NOW()),

    ('Konzert Lieblingsband', 'TARGET_DATE', '2026-06-20', NULL,
     'Open-Air-Konzert im Stadtpark', '#f59e0b', NOW(), NOW()),

    ('Neue Gewohnheit: Joggen', 'SINCE_DATE', NULL, DATEADD('DAY', -12, NOW()),
     'Jeden Morgen 30 Minuten laufen', '#10b981', NOW(), NOW()),

    ('Projekt Hauskauf', 'SINCE_DATE', NULL, DATEADD('DAY', -47, NOW()),
     'Auf der Suche nach dem perfekten Zuhause', '#8b5cf6', NOW(), NOW());
