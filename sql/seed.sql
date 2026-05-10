-- ============================
-- Mini Task Manager — Seed Data
-- ============================

USE task_manager;

-- 1. users
-- password สำหรับทุก account คือ "password123"
-- hash นี้คือ bcrypt round 10 ของ "password123"
INSERT INTO users (id, email, password_hash, name) VALUES
(1, 'ball@dev.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ball'),
(2, 'jane@dev.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane'),
(3, 'sam@dev.com',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sam');

-- 2. projects
INSERT INTO projects (id, name, description, owner_id) VALUES
(10, 'Portfolio v2', 'เว็บ portfolio ของ Ball',  1),
(11, 'ERP System',   'ระบบ ERP สำหรับบริษัท',   2);

-- 3. project_members
INSERT INTO project_members (project_id, user_id, role) VALUES
(10, 1, 'owner'),   -- Ball เป็นเจ้าของ Portfolio
(10, 3, 'member'),  -- Sam เข้าร่วม Portfolio
(11, 2, 'owner'),   -- Jane เป็นเจ้าของ ERP
(11, 1, 'member');  -- Ball เข้าร่วม ERP

-- 4. tasks
INSERT INTO tasks (id, project_id, assignee_id, title, description, status, due_date, position) VALUES
(100, 10, 1,    'Hero section',  'ออกแบบ hero section ใหม่ให้ดูดี',      'done',        '2025-04-10', 0),
(101, 10, 3,    'Dark mode',     'ใช้ CSS variable ทั้งหมด ห้าม hardcode', 'in_progress', '2025-04-20', 0),
(102, 10, NULL, 'SEO meta tags', 'เพิ่ม og:image og:title ทุกหน้า',       'todo',        '2025-04-30', 0),
(103, 11, 2,    'Auth module',   'ทำ JWT login register logout ให้ครบ',    'in_progress', '2025-04-25', 0),
(104, 11, 1,    'User list',     'หน้า admin สำหรับจัดการ user',           'todo',        '2025-05-01', 1);

-- 5. comments
INSERT INTO comments (id, task_id, user_id, body) VALUES
(200, 100, 3, 'LGTM! Ship it ได้เลย'),
(201, 100, 1, 'ขอบคุณ รอ review อีกทีนะ'),
(202, 101, 1, 'ใช้ CSS var ด้วยนะ อย่า hardcode สี'),
(203, 103, 1, 'ลอง bcrypt round 10 ดูครับ'),
(204, 103, 2, 'โอเค จะลองทำดู');