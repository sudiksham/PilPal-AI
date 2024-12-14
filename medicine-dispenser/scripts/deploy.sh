#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Python and dependencies
sudo apt-get install -y python3-pip python3-venv nginx

# Create project directory
mkdir -p ~/medicine-dispenser
cd ~/medicine-dispenser

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Setup environment variables
cat > .env << EOL
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=your_region
ANTHROPIC_API_KEY=your_anthropic_key
EOL

# Setup systemd service
sudo cp medicine-dispenser.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable medicine-dispenser
sudo systemctl start medicine-dispenser

# Setup Nginx
sudo tee /etc/nginx/sites-available/medicine-dispenser << EOL
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOL

# Enable Nginx site
sudo ln -s /etc/nginx/sites-available/medicine-dispenser /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "Deployment completed!"