# ATLAS Supply Chain OS - Hostinger VPS Deployment Guide

## Prerequisites

- Hostinger VPS (Ubuntu 22.04+ recommended)
- SSH access to your VPS: `srv1304213.hstgr.cloud`
- Domain name (optional but recommended)
- MongoDB Atlas account OR local MongoDB installation

---

## Quick Start (Estimated: 30 minutes)

### Step 1: Connect to Your VPS

```bash
ssh root@srv1304213.hstgr.cloud
```

### Step 2: Update System & Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20.x (for serving frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Python 3.11+ and pip
apt install -y python3 python3-pip python3-venv

# Install Nginx (reverse proxy)
apt install -y nginx

# Install certbot for SSL (optional)
apt install -y certbot python3-certbot-nginx

# Install PM2 (process manager for Node.js)
npm install -g pm2 serve
```

### Step 3: Create Application Directory

```bash
mkdir -p /var/www/atlas
cd /var/www/atlas
```

### Step 4: Upload Application Files

**Option A: Using Git (Recommended)**
```bash
# Clone your repository (if using GitHub)
git clone <your-repo-url> .
```

**Option B: Using SCP (from your local machine)**
```bash
# From your LOCAL machine, run:
scp -r /app/frontend/build root@srv1304213.hstgr.cloud:/var/www/atlas/frontend
scp -r /app/backend root@srv1304213.hstgr.cloud:/var/www/atlas/
```

### Step 5: Setup Backend

```bash
cd /var/www/atlas/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install Gunicorn (production server)
pip install gunicorn

# Create .env file
cat > .env << 'EOF'
MONGO_URL="mongodb://localhost:27017"
DB_NAME="atlas_production"
CORS_ORIGINS="https://yourdomain.com,https://srv1304213.hstgr.cloud"
EMERGENT_LLM_KEY=your_llm_key_here
EOF

# Test backend starts correctly
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001 --timeout 120
# Press Ctrl+C after verifying it works
```

### Step 6: Create Systemd Service for Backend

```bash
cat > /etc/systemd/system/atlas-backend.service << 'EOF'
[Unit]
Description=ATLAS Supply Chain OS Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/atlas/backend
Environment="PATH=/var/www/atlas/backend/venv/bin"
EnvironmentFile=/var/www/atlas/backend/.env
ExecStart=/var/www/atlas/backend/venv/bin/gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8001 --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Set permissions
chown -R www-data:www-data /var/www/atlas

# Enable and start service
systemctl daemon-reload
systemctl enable atlas-backend
systemctl start atlas-backend
systemctl status atlas-backend
```

### Step 7: Configure Nginx

```bash
cat > /etc/nginx/sites-available/atlas << 'EOF'
server {
    listen 80;
    server_name srv1304213.hstgr.cloud;  # Replace with your domain

    # Frontend (React static files)
    root /var/www/atlas/frontend;
    index index.html;

    # Handle React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    # WebSocket support
    location /api/ws {
        proxy_pass http://127.0.0.1:8001/api/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/atlas /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx
```

### Step 8: Setup SSL (Optional but Recommended)

```bash
# If you have a domain pointed to your VPS:
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# For testing without domain, use self-signed cert or skip SSL
```

### Step 9: Setup MongoDB (If Not Using Atlas)

```bash
# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
```

---

## Environment Variables Reference

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017     # or MongoDB Atlas connection string
DB_NAME=atlas_production                # Database name
CORS_ORIGINS=https://yourdomain.com     # Allowed origins (comma-separated)
EMERGENT_LLM_KEY=sk-xxxxx      # Your LLM key
```

### Frontend (build-time)
The frontend is pre-built with the production URL. If you need to change it:
```bash
cd /var/www/atlas/frontend-src  # If you uploaded source
REACT_APP_BACKEND_URL=https://yourdomain.com yarn build
cp -r build/* /var/www/atlas/frontend/
```

---

## Useful Commands

```bash
# View backend logs
journalctl -u atlas-backend -f

# Restart backend
systemctl restart atlas-backend

# Restart Nginx
systemctl restart nginx

# Check backend status
systemctl status atlas-backend

# Check Nginx status
systemctl status nginx

# Test backend API
curl http://localhost:8001/api/

# Update application
cd /var/www/atlas && git pull
systemctl restart atlas-backend
```

---

## Troubleshooting

### Backend won't start
```bash
# Check logs
journalctl -u atlas-backend -n 100

# Test manually
cd /var/www/atlas/backend
source venv/bin/activate
python -c "from server import app; print('OK')"
```

### 502 Bad Gateway
```bash
# Check if backend is running
systemctl status atlas-backend

# Check Nginx error logs
tail -f /var/log/nginx/error.log
```

### MongoDB connection issues
```bash
# Check MongoDB status
systemctl status mongod

# Test connection
mongosh --eval "db.stats()"
```

---

## Security Checklist

- [ ] Change SSH port (optional)
- [ ] Setup UFW firewall: `ufw allow 80,443,22/tcp && ufw enable`
- [ ] Use SSL certificates
- [ ] Set secure CORS_ORIGINS
- [ ] Use MongoDB authentication in production
- [ ] Regular backups configured

---

## Production Build Info

**Frontend Build Size:**
- main.js: ~221 KB (gzipped)
- main.css: ~22 KB (gzipped)

**Backend Requirements:**
- Python 3.11+
- FastAPI 0.110.1
- Gunicorn with Uvicorn workers
- MongoDB 6.0+ or Atlas

---

## Support

For issues with deployment:
1. Check logs: `journalctl -u atlas-backend -f`
2. Verify Nginx config: `nginx -t`
3. Test API directly: `curl http://localhost:8001/api/`
