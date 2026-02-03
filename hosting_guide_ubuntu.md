# Step-by-Step Hosting Guide for Ubuntu (Beginner Friendly)

This guide will walk you through hosting your **ProcessMind AI** application on a fresh Ubuntu server (like AWS EC2, DigitalOcean Droplet, or Linode).

---

## 1. Prerequisites
Before you start, make sure you have:
1.  **A Server**: An Ubuntu 22.04 or 24.04 server.
2.  **Access**: The IP address of your server and the SSH key (or password).
3.  **Domain Name (Optional)**: If you want a pretty URL (e.g., `myapp.com`). If not, you can use the IP address.

---

## 2. Connect to Your Server
Open your terminal (Command Prompt or PowerShell on Windows, Terminal on Mac) on your **local computer**.

```powershell
# Replace 'your-key.pem' with your actual key file and '1.2.3.4' with your server IP
ssh -i path/to/your-key.pem ubuntu@1.2.3.4
```

> **Note:** If you are using a password instead of a key: `ssh root@1.2.3.4`

---

## 3. Server Setup (Run these on the Server)
Once logged in, run these commands one by one to update the system and install necessary tools.

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install basic tools (Git, Curl, Unzip)
sudo apt install -y git curl unzip

# 3. Install Node.js (Version 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Verify installation
node -v  # Should show v20.x.x
npm -v   # Should show 10.x.x
```

---

## 4. Install PM2 (Process Manager)
PM2 keeps your backend running 24/7, even if the server restarts.

```bash
sudo npm install -g pm2
```

---

## 5. Get Your Code onto the Server
Since you have the code on your local computer, you have two main options:

### Option A: Using Git (Recommended)
1.  Upload your code to GitHub/GitLab.
2.  Clone it on the server:
    ```bash
    # Go to the home directory
    cd ~
    
    # Clone your repo (replace with your actual repo URL)
    git clone https://github.com/YOUR_USERNAME/process-mind-AI-2.git
    
    # Rename folder to something simple (optional)
    mv process-mind-AI-2 app
    ```

### Option B: Using FileZilla / SCP (If you don't use Git)
Use a tool like **FileZilla** to drag and drop your project folder (exclude `node_modules` folders) to `/home/ubuntu/app` on the server.

---

## 6. Backend Setup
Now let's get the server running.

```bash
# 1. Go to the server folder
cd ~/app/server

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
# Copy the example file
cp .env.example .env

# Open the file to edit it
nano .env
```

**Inside the editor:**
- Use arrow keys to move.
- Paste your **REAL** API keys (Gemini, Supabase, etc.).
- Ensure `PORT=5000`.
- Press `Ctrl+X`, then `Y`, then `Enter` to save.

```bash
# 4. Start the backend with PM2
pm2 start ecosystem.config.js
# OR if ecosystem.config.js doesn't exist/work:
pm2 start index.js --name "backend"

# 5. Save the process list so it restarts on boot
pm2 save
pm2 startup
# (Run the command that 'pm2 startup' outputs if asked)
```

---

## 7. Frontend Setup
We will "build" the frontend into static HTML/CSS/JS files and serve them with Nginx.

```bash
# 1. Go to the client folder
cd ~/app/client

# 2. Install dependencies
npm install

# 3. Configure Environment Variables for Frontend
nano .env
```

**Add this line to the file:**
(Replace `1.2.3.4` with your Server IP or Domain)
```env
VITE_API_URL=http://1.2.3.4/api
```
*Note: If you have a domain, use `http://yourdomain.com/api`.*

```bash
# 4. Build the project
npm run build
```
This will create a `dist` folder with your website files.

---

## 8. Nginx Setup (The Web Server)
Nginx sits in front of your app, serving the frontend files and passing API requests to the backend.

```bash
# 1. Install Nginx
sudo apt install -y nginx

# 2. Create a configuration file
sudo nano /etc/nginx/sites-available/process-mind
```

**Paste this configuration:**
(Replace `your_server_ip` with your actual IP or Domain)

```nginx
server {
    listen 80;
    server_name your_server_ip;  # e.g., 123.45.67.89 or example.com

    root /home/ubuntu/app/client/dist;
    index index.html;

    # Serve Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Backend (Port 5000)
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

**Save and Exit:** (`Ctrl+X` -> `Y` -> `Enter`)

```bash
# 3. Enable the site
sudo ln -s /etc/nginx/sites-available/process-mind /etc/nginx/sites-enabled/

# 4. Test configuration (should say "syntax is okay")
sudo nginx -t

# 5. Remove default Nginx page
sudo rm /etc/nginx/sites-enabled/default

# 6. Restart Nginx
sudo systemctl restart nginx
```

---

## 9. Final Check
Open your browser and visit: `http://YOUR_SERVER_IP`

- You should see your application.
- Try logging in or performing an action to verify the backend connection.

---

## 10. (Optional) Add SSL/HTTPS
If you have a domain name (not just an IP), secure it with HTTPS for free.

```bash
sudo apt install -y python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```
Follow the prompts, and you're done!

---

### Troubleshooting
- **Backend not working?** check logs: `pm2 logs backend`
- **Frontend error?** Check browser console (F12).
- **502 Bad Gateway?** Your backend might be crashed or not running on port 5000.
