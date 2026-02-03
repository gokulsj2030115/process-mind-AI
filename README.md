# ProcessMind AI - Process Documentation Q&A

A full-stack application for managing state-specific process documentation and answering user questions using Google Gemini AI.

## Features
*   **Admin Dashboard**: Upload PDF, Word, Excel, and Image files for any US State.
*   **AI Processing**: Automatically extracts text and understands process flows using Gemini AI.
*   **Q&A Interface**: Public-facing chat interface to ask questions about state processes.
*   **Grammar Correction**: Automatically fixes typos in user questions before processing.
*   **Secure Auth**: Admin authentication using JWT.

## Tech Stack
*   **Frontend**: React, Tailwind CSS, Lucide Icons
*   **Backend**: Node.js, Express, Multer
*   **Database**: Supabase (PostgreSQL)
*   **AI**: Google Gemini Pro, Tesseract.js (OCR)

## Prerequisites
1.  Node.js installed.
2.  A [Supabase](https://supabase.com/) project.
3.  A [Google AI Studio](https://makersuite.google.com/) API Key.

## Setup Instructions

### 1. Database Setup
1.  Go to your Supabase Project -> **SQL Editor**.
2.  Run the contents of `server/src/db/schema.sql`.

### 2. Backend Setup
1.  Navigate to `server` directory: `cd server`
2.  Install dependencies: `npm install`
3.  Create `.env` file based on `.env.example`:
    ```env
    PORT=5000
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    JWT_SECRET=some_random_secret_string
    GEMINI_API_KEY=your_gemini_key
    ```
4.  Start the server: `npm run dev`

### 3. Frontend Setup
1.  Navigate to `client` directory: `cd client`
2.  Install dependencies: `npm install`
3.  Start the dev server: `npm run dev`

## Usage
*   Access the **Frontend** at `http://localhost:5173`
*   Access the **Admin Login** at `http://localhost:5173/login`
    *   *Note: You will need to manually insert an admin user into the `users` table via Supabase or use the `/api/auth/register` endpoint initially.*
