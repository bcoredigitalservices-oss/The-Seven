-- PostgreSQL DB Schema for SEVEN Workspace Ecosystem

-- Drop tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS channels CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS channel_type CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Custom types and enums
CREATE TYPE user_role AS ENUM ('Admin', 'Architect', 'Developer');
CREATE TYPE user_status AS ENUM ('Active', 'Deep Work', 'Blocked', 'Offline');
CREATE TYPE task_status AS ENUM ('Backlog', 'Assigned', 'In Progress', 'Blocked', 'Review', 'QA', 'Deployed', 'Done');
CREATE TYPE channel_type AS ENUM ('Task', 'Epic', 'Blocker_Beacon');

-- Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'Developer',
    current_status user_status DEFAULT 'Active'
);

-- Projects Table
CREATE TABLE projects (
    project_id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active'
);

-- Tasks Table
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(project_id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'Backlog'
);

-- Channels Table (Communication Layer)
CREATE TABLE channels (
    channel_id UUID PRIMARY KEY,
    attached_task_id UUID REFERENCES tasks(task_id) ON DELETE CASCADE,
    channel_type channel_type NOT NULL
);

-- Messages Table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY,
    channel_id UUID REFERENCES channels(channel_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_code_snippet BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
