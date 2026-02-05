#!/bin/bash
# ATLAS Supply Chain OS - VPS Setup Script
# Run this on your Hostinger VPS as root

set -e

echo "==========================================="
echo "  ATLAS Supply Chain OS - VPS Setup"
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root"
    exit 1
fi

# Update system
echo ""
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js
print_status "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install Python
print_status "Installing Python 3.11..."
apt install -y python3 python3-pip python3-venv

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Install Certbot
print_status "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Install PM2 and serve
print_status "Installing PM2 and serve..."
npm install -g pm2 serve

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/atlas/frontend
mkdir -p /var/www/atlas/backend

# Set permissions
chown -R www-data:www-data /var/www/atlas

# Setup firewall
print_status "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Print versions
echo ""
echo "==========================================="
echo "  Installation Complete!"
echo "==========================================="
echo ""
print_status "Node.js: $(node --version)"
print_status "npm: $(npm --version)"
print_status "Python: $(python3 --version)"
print_status "Nginx: $(nginx -v 2>&1)"
echo ""
print_warning "Next steps:"
echo "  1. Upload your application files to /var/www/atlas/"
echo "  2. Configure backend .env file"
echo "  3. Setup Nginx configuration"
echo "  4. Start services"
echo ""
echo "Run: bash /var/www/atlas/deploy/start-services.sh"
