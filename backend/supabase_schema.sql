-- SEVEN Workspace Ecosystem - Production Database Schema (Supabase PostgreSQL)
-- Phase 1: Database Architecture

-- ==========================================
-- 1. ENUMS
-- ==========================================
CREATE TYPE user_status AS ENUM ('Active', 'Deep Work', 'Blocked', 'Offline');
CREATE TYPE task_status AS ENUM ('Backlog', 'In Progress', 'Review', 'QA', 'Done');

-- ==========================================
-- 2. TABLES
-- ==========================================

-- Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE, -- e.g., DEV, QA, SEC
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Users Table
-- Note: id should map 1:1 with Supabase auth.users in a real environment
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Maps to auth.users.id
    full_name VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role_tier INTEGER NOT NULL CHECK (role_tier BETWEEN 1 AND 4),
    current_status user_status DEFAULT 'Offline'::user_status,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Squads Table
CREATE TABLE squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Squads (Junction Table for M:N mapping)
CREATE TABLE user_squads (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, squad_id)
);

-- Tasks Table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status task_status DEFAULT 'Backlog'::task_status,
    is_blocker BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Channels Table (Context-Attached Comm)
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_entity_id UUID NOT NULL, -- Flexible ID for polymorphic association (e.g., task_id)
    target_entity_type VARCHAR(50) NOT NULL, -- e.g., 'task', 'squad', 'lead'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_code_snippet BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activity Logs Table (Immutable Ledger)
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(255) NOT NULL, -- e.g., 'STATUS_CHANGE', 'BLOCKER_RAISED'
    target_entity_id UUID, -- Optional pointer to the affected entity
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ==========================================

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Note: Basic RLS is enabled above to prevent default public access. 
-- Appropriate policies (e.g., CREATE POLICY ...) must be defined based on business logic.
