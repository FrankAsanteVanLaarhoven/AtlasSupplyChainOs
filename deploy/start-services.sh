#!/bin/bash
# ATLAS Supply Chain OS - Start Services Script
# Run this after uploading files to /var/www/atlas/

set -e

echo "==========================================="
echo "  ATLAS - Starting Services"
echo "==========================================="

APP_DIR="/var/www/atlas"
BACKEND_DIR="$APP_DIR/backend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }

# Setup Python virtual environment
print_status "Setting up Python virtual environment..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Create systemd service
print_status "Creating systemd service..."
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
chown -R www-data:www-data $APP_DIR

# Start backend
print_status "Starting backend service..."
systemctl daemon-reload
systemctl enable atlas-backend
systemctl start atlas-backend

# Check status
sleep 2
if systemctl is-active --quiet atlas-backend; then
    print_status "Backend service is running!"
else
    print_warning "Backend service failed to start. Check logs with: journalctl -u atlas-backend -f"
fi

# Reload Nginx
print_status "Reloading Nginx..."
nginx -t && systemctl reload nginx

echo ""
echo "==========================================="
echo "  Services Started!"
echo "==========================================="
echo ""
echo "Backend: systemctl status atlas-backend"
echo "Nginx:   systemctl status nginx"
echo "Logs:    journalctl -u atlas-backend -f"
