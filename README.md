# RV Classifieds Deployment Guide

This project contains a React frontend and a FastAPI backend packaged with Docker.
The easiest way to run the application on an Ubuntu VPS is to use Docker Compose.

## Quick Start

1. **Install Docker and Docker Compose**
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   sudo systemctl enable --now docker
   ```

2. **Clone the repository**
   ```bash
   git clone https://github.com/your-user/RV-Listings.git
   cd RV-Listings
   ```

3. **Create an environment file**
   ```bash
   cp .env.example .env
   # edit .env and adjust passwords and domain names
   ```

4. **Start the stack**
   ```bash
   docker-compose up -d
   ```

The frontend will be available on port `3000` and the backend API on `8000`.

## Running Without Docker

If you prefer running the backend directly on the host:

```bash
sudo apt install -y python3 python3-venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r backend/requirements.txt
uvicorn backend.server:app --reload --port 8000
```

The React frontend can be served with `yarn start` inside the `frontend` folder.

For more details see [`QUICK-START.md`](QUICK-START.md) or [`DOCKER-DEPLOYMENT.md`](DOCKER-DEPLOYMENT.md).
