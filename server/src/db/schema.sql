-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password_hash text not null,
  role text default 'user', -- 'admin', 'user'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Documents Table
create table if not exists documents (
  id uuid default uuid_generate_v4() primary key,
  state text not null,
  file_name text not null,
  file_type text not null,
  original_content text, -- Extracted text
  processed_content text, -- Gemini summary/understanding
  version int default 1,
  upload_date timestamp with time zone default timezone('utc'::text, now())
);

-- Conversations Table
create table if not exists conversations (
  id uuid default uuid_generate_v4() primary key,
  state text not null,
  question text not null,
  corrected_question text,
  answer text,
  timestamp timestamp with time zone default timezone('utc'::text, now())
);
