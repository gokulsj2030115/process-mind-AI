# Deployment Guide: AWS EC2

Follow these steps to deploy the Process Documentation Q&A application to an AWS EC2 instance.

## 1. Prerequisites

- An AWS EC2 Instance (Ubuntu 22.04 LTS recommended).
- Security Group rules allowing ports `80` (HTTP), `443` (HTTPS), and `22` (SSH).
- Node.js (v18+) and npm installed.
- Git installed.

## 2. Server Setup

SSH into your EC2 instance and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NVM)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
source ~/.bashrc
nvm install 20

# Install PM2
npm install -g pm2
```

## 3. Clone and Prepare Application

```bash
git clone https://github.com/your-username/process-doc-qa.git
cd process-doc-qa

# Setup PlanetScale/Supabase and Gemini env vars
# Create server/.env file based on your local one
```

## 4. Backend Deployment (PM2)

```bash
cd server
npm install
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Frontend Deployment (Vite)

You can serve the frontend via Nginx.

```bash
cd ../client
npm install
# Update .env or api.js to point to your EC2 public IP or domain
npm run build
```

## 6. Nginx Configuration

Install Nginx:
```bash
sudo apt install nginx -y
```

Create a site config:
```bash
sudo nano /etc/nginx/sites-available/process-doc-qa
```

Paste this configuration (replace `your-domain.com` or `public-ip`):

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /home/ubuntu/process-doc-qa/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/process-doc-qa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Environment Variables Summary

Ensure these are set on the EC2 instance:
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `SUPABASE_URL`: Your Supabase URL.
- `SUPABASE_KEY`: Your Supabase Service Role/Anon Key.
- `PORT`: 5000 (default used in Nginx proxy).
- `CLIENT_URL`: The URL where your frontend is hosted.
