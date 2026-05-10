-- ============================
-- Mini Task Manager — Schema
-- ============================

CREATE DATABASE IF NOT EXISTS task_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE task_manager;

-- 1. users
CREATE TABLE users (
  id            INT           NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

-- 2. projects
CREATE TABLE projects (
  id          INT           NOT NULL AUTO_INCREMENT,
  name        VARCHAR(255)  NOT NULL,
  description TEXT,
  owner_id    INT           NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_projects_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. project_members
CREATE TABLE project_members (
  id         INT                     NOT NULL AUTO_INCREMENT,
  project_id INT                     NOT NULL,
  user_id    INT                     NOT NULL,
  role       ENUM('owner', 'member') NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMP               NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_project_user (project_id, user_id),
  CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- 4. tasks
CREATE TABLE tasks (
  id          INT                                  NOT NULL AUTO_INCREMENT,
  project_id  INT                                  NOT NULL,
  assignee_id INT                                  NULL,
  title       VARCHAR(255)                         NOT NULL,
  description TEXT,
  status      ENUM('todo', 'in_progress', 'done')  NOT NULL DEFAULT 'todo',
  due_date    DATE,
  position    INT                                  NOT NULL DEFAULT 0,
  created_at  TIMESTAMP                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tasks_board (project_id, status, position),
  CONSTRAINT fk_tasks_project  FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES users(id)    ON DELETE SET NULL
);

-- 5. comments
CREATE TABLE comments (
  id         INT       NOT NULL AUTO_INCREMENT,
  task_id    INT       NOT NULL,
  user_id    INT       NOT NULL,
  body       TEXT      NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_task (task_id),
  CONSTRAINT fk_comments_task FOREIGN KEY (task_id)  REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE
);