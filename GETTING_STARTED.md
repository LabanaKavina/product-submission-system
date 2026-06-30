# Getting Started Guide

Complete setup instructions for **Windows, Mac, and Linux** using either **Docker** (recommended) or **manual setup**.

---

## 🎯 Choose Your Setup Method

### 🐳 **Option 1: Docker Setup (Recommended)** ⭐
- ✅ Fastest and easiest setup
- ✅ No MySQL installation needed
- ✅ Everything runs in containers
- ✅ **Setup time: 5 minutes**
- 📖 [Jump to Docker Setup](#option-1-docker-setup-recommended)

### 💻 **Option 2: Manual Setup (Without Docker)**
- ✅ Direct installation on your machine
- ✅ More control over services
- ⚠️ Requires MySQL installation
- ⏱️ **Setup time: 15-20 minutes**
- 📖 [Jump to Manual Setup](#option-2-manual-setup-without-docker)

---

# Option 1: Docker Setup (Recommended)

## Prerequisites

**Only Docker Desktop is needed!**

### Install Docker Desktop

#### Windows
1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Run the installer
3. Follow installation wizard
4. Restart your computer if prompted
5. Launch Docker Desktop and wait for it to start

#### Mac
1. Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
2. Open the `.dmg` file
3. Drag Docker to Applications folder
4. Open Docker from Applications
5. Grant necessary permissions

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
sudo apt update
sudo apt install docker.io docker-compose-v2
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional, to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### Verify Docker Installation

```bash
docker --version
docker compose version
```

---

## Quick Start with Docker

### 1. Clone the Project

```bash
git clone <repository-url>
cd product-submission-system
```

### 2. Start All Services

**That's it! Just run:**

```bash
docker compose up
```

Or to run in background:
```bash
docker compose up -d
```

**What happens:**
- ✅ Pulls MySQL 8.0 image
- ✅ Builds backend and frontend images
- ✅ Creates database automatically
- ✅ Runs migrations automatically
- ✅ Seeds default users automatically
- ✅ Starts all three services

**Wait 2-3 minutes for first-time build.**

### 3. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:5000 |
| **MySQL** | localhost:3307 (internal) |

### 4. Login

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@example.com   | admin123 |
| User  | user@example.com    | user123  |

---

## Docker Commands Reference

```bash
# Start all services
docker compose up

# Start in background (detached mode)
docker compose up -d

# Stop all services
docker compose down

# Stop and remove all data (reset everything)
docker compose down -v

# View logs
docker compose logs

# View logs for specific service
docker compose logs backend
docker compose logs frontend
docker compose logs mysql

# Follow logs in real-time
docker compose logs -f

# Restart a specific service
docker compose restart backend

# Run migrations manually (if needed)
docker compose exec backend npm run db:migrate

# Run seeds manually (if needed)
docker compose exec backend npm run db:seed

# Access MySQL database
docker compose exec mysql mysql -u appuser -papppassword product_submission_db

# Access backend container shell
docker compose exec backend sh

# Check running containers
docker compose ps

# Rebuild images after code changes
docker compose up --build
```

---

## Docker Troubleshooting

### ❌ Error: Docker daemon not running

**Windows/Mac:**
1. Open Docker Desktop application
2. Wait for it to fully start (whale icon in system tray)

**Linux:**
```bash
sudo systemctl start docker
sudo systemctl status docker
```

---

### ❌ Error: Port already in use

Check if ports 3000, 5000, or 3307 are already in use:

**Windows:**
```cmd
netstat -ano | findstr :3000
netstat -ano | findstr :5000
netstat -ano | findstr :3307
```

**Mac/Linux:**
```bash
lsof -ti:3000
lsof -ti:5000
lsof -ti:3307
```

**Solution:** Stop the conflicting process or change ports in `.env` file.

---

### ❌ Backend exits immediately on first run

This is normal! MySQL needs time to initialize on first startup.

**Solution:** Run `docker compose up` again. MySQL will already be ready the second time.

---

### ❌ Error: CORS issues

The Docker setup handles CORS automatically. If you still see issues:

1. Make sure you're accessing frontend at `http://localhost:3000`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Check backend logs: `docker compose logs backend`

---

### ❌ Changes not reflecting

**For code changes:**
- Backend: Changes auto-reload (nodemon)
- Frontend: Changes auto-reload (React hot reload)
- If not working: `docker compose restart backend` or `docker compose restart frontend`

**For dependency changes (package.json):**
```bash
docker compose down
docker compose up --build
```

---

### ❌ Database issues / Want fresh start

```bash
# Stop everything and remove all data
docker compose down -v

# Start fresh
docker compose up
```

This will recreate the database from scratch.

---

## Docker Setup Complete! 🎉

Your application is now running:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**Next steps:**
1. Login with default credentials
2. Test creating products
3. Test admin approval workflow
4. Import Postman collection for API testing

---

# Option 2: Manual Setup (Without Docker)

## Prerequisites

Install these before starting:

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **MySQL 8.0** - Download from [mysql.com](https://dev.mysql.com/downloads/installer/)
3. **Git** (if cloning the repository)

---

## Prerequisites

Install these before starting:

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **MySQL 8.0** - Download from [mysql.com](https://dev.mysql.com/downloads/installer/)
3. **Git** (if cloning the repository)

---

## Step 1: Install MySQL

### Windows
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run the installer and select "Developer Default"
3. Set root password during installation
4. MySQL will start automatically as a Windows service

### Mac
```bash
# Using Homebrew (recommended)
brew install mysql
brew services start mysql

# Secure installation
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo mysql_secure_installation
```

### Verify MySQL is Running

**Windows:**
```cmd
# Open Services (services.msc) and check if MySQL80 is running
# OR use command:
sc query MySQL80
```

**Mac/Linux:**
```bash
# Mac
brew services list | grep mysql

# Linux
sudo systemctl status mysql
```

---

## Step 2: Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE product_submission_db;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON product_submission_db.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

**Test the connection:**

```bash
mysql -u appuser -p
# Enter password: apppassword
# If successful, you'll see: mysql>
# Type: exit
```

---

## Step 3: Clone or Download Project

**Option A: Clone with Git**
```bash
git clone <repository-url>
cd product-submission-system
```

**Option B: Download ZIP**
1. Download and extract the project
2. Open terminal/command prompt in the project folder

---

## Step 4: Backend Setup

### 1. Navigate to Backend

**Windows (Command Prompt):**
```cmd
cd backend
```

**Mac/Linux:**
```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

Wait 2-3 minutes for installation to complete.

### 3. Create Environment File

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 4. Edit Backend Environment File

Open `backend/.env` in any text editor and update:

```env
NODE_ENV=development
PORT=5000

# IMPORTANT: Change DATABASE_HOST from 'mysql' to 'localhost'
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=product_submission_db
DATABASE_USER=appuser
DATABASE_PASSWORD=apppassword

JWT_SECRET=your-secret-key-change-this-12345
JWT_EXPIRATION=24h

# Add this line for CORS
FRONTEND_URL=http://localhost:3000
```

**⚠️ Critical:** Make sure `DATABASE_HOST=localhost` (NOT `mysql`)

### 5. Run Database Migrations

```bash
npm run db:migrate
```

**Expected output:**
```
== 20260623163703-create-users: migrating =======
== 20260623163703-create-users: migrated
== 20260623163704-create-products: migrating =======
== 20260623163704-create-products: migrated
== 20260623163705-create-variants: migrating =======
== 20260623163705-create-variants: migrated
```

### 6. Seed Default Users

```bash
npm run db:seed
```

**Expected output:**
```
== 20260623163800-seed-default-users: migrating =======
== 20260623163800-seed-default-users: migrated
```

### 7. Start Backend Server

```bash
npm run dev
```

**Expected output:**
```
✓ Database connection established successfully
✓ Database models synchronized
Server is running on port 5000
```

**✅ Keep this terminal window open!**

---

## Step 5: Frontend Setup

### 1. Open New Terminal

**Keep the backend terminal running and open a NEW terminal window.**

**Windows:**
- Press `Win + R`, type `cmd`, press Enter
- Navigate to project: `cd C:\path\to\product-submission-system`

**Mac:**
- Press `Cmd + Space`, type `terminal`, press Enter
- Navigate to project: `cd /path/to/product-submission-system`

**Linux:**
- Press `Ctrl + Alt + T`
- Navigate to project: `cd /path/to/product-submission-system`

### 2. Navigate to Frontend

```bash
cd frontend
```

### 3. Install Dependencies

```bash
npm install
```

Wait 2-3 minutes for installation.

### 4. Create Environment File

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

**Mac/Linux:**
```bash
cp .env.example .env
```

### 5. Verify Frontend Environment

Open `frontend/.env` and ensure:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 6. Start Frontend Server

```bash
npm start
```

**Expected behavior:**
- Browser will automatically open to `http://localhost:3000`
- You should see the login page
- If browser doesn't open, manually navigate to `http://localhost:3000`

---

## Step 6: Login and Test

### Default Credentials

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@example.com   | admin123 |
| User  | user@example.com    | user123  |

### Test the Application

1. **Login as User** (`user@example.com` / `user123`)
2. Click "Submit Product"
3. Fill in product details and add variants with images
4. Submit the product
5. **Logout** and login as Admin (`admin@example.com` / `admin123`)
6. View all products and approve/reject

---

## Quick Commands Reference

### After Initial Setup

You only need these two commands to start the app:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## Troubleshooting

### ❌ Error: Cannot connect to database

**Check MySQL is running:**

**Windows:**
```cmd
sc query MySQL80
# If stopped, start it:
net start MySQL80
```

**Mac:**
```bash
brew services list
# If stopped:
brew services start mysql
```

**Linux:**
```bash
sudo systemctl status mysql
# If stopped:
sudo systemctl start mysql
```

**Verify credentials:**
```bash
mysql -u appuser -p
# Enter password: apppassword
```

If login fails, recreate the user:
```sql
DROP USER IF EXISTS 'appuser'@'localhost';
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON product_submission_db.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

---

### ❌ Error: CORS policy blocking requests

**Fix:**
1. Open `backend/.env`
2. Add or update: `FRONTEND_URL=http://localhost:3000`
3. **Restart backend** (Ctrl+C, then `npm run dev`)
4. Clear browser cache (Ctrl+Shift+Delete)
5. Refresh page (Ctrl+F5)

---

### ❌ Error: Port already in use

**Windows:**
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace <PID> with the number shown)
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or for port 3000
lsof -ti:3000 | xargs kill -9
```

---

### ❌ Error: Sequelize command not found

**Option 1: Use npx**
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

**Option 2: Install globally**
```bash
npm install -g sequelize-cli
```

---

### ❌ Error: Migration fails - database doesn't exist

The database wasn't created. Run in MySQL:
```sql
CREATE DATABASE product_submission_db;
```

Then try migrations again:
```bash
npm run db:migrate
```

---

### ❌ Error: Images not loading

**Check uploads directory exists:**

**Windows:**
```cmd
cd backend
mkdir uploads
```

**Mac/Linux:**
```bash
cd backend
mkdir -p uploads
```

**Test image serving:**
- Upload a product with images
- Check `backend/uploads/` folder - images should be saved there
- Open `http://localhost:5000/uploads/<filename>` - you should see the image

---

### ❌ Error: Cannot find module

Delete and reinstall dependencies:

**Windows:**
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

**Mac/Linux:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

### ❌ Login fails with default credentials

**Verify users exist:**
```sql
USE product_submission_db;
SELECT email, role FROM users;
```

**If empty, reseed:**
```bash
cd backend
npm run db:seed
```

---

### 🔍 Run Diagnostic Check

```bash
node check-setup.js
```

This will check your environment and highlight any issues.

---

## Resetting Everything

If you want to start completely fresh:

### 1. Stop Both Servers
Press `Ctrl+C` in both terminal windows

### 2. Reset Database
```sql
DROP DATABASE IF EXISTS product_submission_db;
CREATE DATABASE product_submission_db;
GRANT ALL PRIVILEGES ON product_submission_db.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Re-run Migrations and Seeds
```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 4. Start Again
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm start
```

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| Node.js   | 18.0    | 20.0+       |
| npm       | 8.0     | 10.0+       |
| MySQL     | 8.0     | 8.0+        |
| RAM       | 4 GB    | 8 GB+       |
| Disk Space| 2 GB    | 5 GB+       |

---

## URLs Reference

| Service  | URL                      | Notes                          |
|----------|--------------------------|--------------------------------|
| Frontend | http://localhost:3000    | React application              |
| Backend  | http://localhost:5000    | REST API                       |
| Uploads  | http://localhost:5000/uploads | Static image files        |
| MySQL    | localhost:3306           | Database (internal)            |

---

## Default Credentials

| Role  | Email               | Password | Access                          |
|-------|---------------------|----------|---------------------------------|
| Admin | admin@example.com   | admin123 | View all, approve/reject        |
| User  | user@example.com    | user123  | Submit products, view own       |

---

## File Structure Quick Reference

```
product-submission-system/
├── backend/
│   ├── .env                 ← Create this (from .env.example)
│   ├── src/
│   │   ├── migrations/      ← Database table definitions
│   │   ├── seeders/         ← Default user data
│   │   └── ...
│   └── uploads/             ← Product images saved here
├── frontend/
│   ├── .env                 ← Create this (from .env.example)
│   └── src/
└── GETTING_STARTED.md       ← This file
```

---

## Common Mistakes to Avoid

❌ **Forgetting to change `DATABASE_HOST=mysql` to `localhost`**
- The value `mysql` is for Docker only

❌ **Not adding `FRONTEND_URL` to backend `.env`**
- This causes CORS errors

❌ **Starting frontend before backend**
- Always start backend first

❌ **Not keeping backend terminal open**
- Backend must run continuously

❌ **MySQL not running**
- Check and start MySQL service before running backend

❌ **Using different ports in `.env` files**
- Backend and frontend `.env` files must match

---

## Next Steps

Once running successfully:

1. **API Testing:** Import `postman_collection.json` into Postman
2. **Documentation:** Read the main `README.md` for API details
3. **Customization:** Modify code as needed
4. **Production:** See README for production deployment notes

---

## Getting Help

If you still have issues:

1. ✅ Check both terminal windows for error messages
2. ✅ Review browser console (F12) for frontend errors
3. ✅ Verify MySQL is running and credentials are correct
4. ✅ Ensure both `.env` files are configured correctly
5. ✅ Try resetting the database completely

---

## Platform-Specific Notes

### Windows Users
- Use Command Prompt or PowerShell
- Path separator: `\` (backslash)
- MySQL service name: `MySQL80` (may vary)
- Quick start: Double-click `start.bat`

### Mac Users
- Use Terminal
- Path separator: `/` (forward slash)
- Install MySQL with Homebrew for easier management
- Make scripts executable: `chmod +x start.sh`
- Quick start: `./start.sh`

### Linux Users
- Use any terminal
- Path separator: `/` (forward slash)
- May need `sudo` for MySQL commands
- Make scripts executable: `chmod +x start.sh`
- Quick start: `./start.sh`

---

**🎉 You're all set! Happy coding!**
