# Product Submission System

A full-stack web application that enables role-based product submission and review workflows. Users can submit products with multiple variants for review, and Admins can approve or reject submissions.

## Quick Start with Docker

The easiest way to run the entire application stack:

```bash
# Clone the repository
git clone <repository-url>
cd product-submission-system

# Copy environment variables (or use defaults in docker-compose.yml)
cp .env.example .env

# Start all services
docker-compose up

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# MySQL: localhost:3306
```

The Docker setup includes:
- MySQL database with automatic migrations and seeding
- Backend API with hot-reload support
- Frontend React app with hot-reload support
- Named volumes for data persistence

## Default Credentials

For testing purposes, two users are seeded automatically:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

**Regular User:**
- Email: `user@example.com`
- Password: `user123`

## Technology Stack

**Backend:**
- Node.js 18 LTS with TypeScript
- Express.js framework
- MySQL database
- Sequelize ORM with migrations and seeders
- JWT authentication (jsonwebtoken + bcrypt)
- Joi validation
- Multer for file uploads

**Frontend:**
- React with TypeScript
- React Router v6
- Context API for state management
- Native Fetch API
- Tailwind CSS

**Infrastructure:**
- Docker & Docker Compose
- Named volumes for persistence
- Hot-reload in development

## Project Structure

```
product-submission-system/
├── backend/              # Node.js/Express backend
│   ├── src/             # Source code (to be implemented)
│   ├── uploads/         # Local file storage for images
│   ├── Dockerfile       # Backend container configuration
│   └── .env.example     # Backend environment template
├── frontend/            # React frontend
│   ├── src/             # Source code (to be implemented)
│   ├── Dockerfile       # Frontend container configuration
│   └── .env.example     # Frontend environment template
├── docker-compose.yml   # Multi-container orchestration
├── .env.example         # Root environment template
└── README.md           # This file
```

## Manual Setup

If you prefer to run without Docker:

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or 5.7
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm start
```

## Environment Variables

### Backend (.env)
- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Backend server port (default: 5000)
- `DATABASE_HOST`: MySQL host
- `DATABASE_PORT`: MySQL port (default: 3306)
- `DATABASE_NAME`: Database name
- `DATABASE_USER`: Database user
- `DATABASE_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRATION`: Token expiration time (default: 24h)

### Frontend (.env)
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:5000)
- `PORT`: Frontend dev server port (default: 3000)

## Architecture Overview

The application follows a **monolithic architecture** with clear module separation:

- **Authentication Module**: JWT-based auth with role-based access control
- **Product Module**: CRUD operations for products and variants
- **Review Module**: Admin approval/rejection workflow
- **File Upload**: Local storage with Multer
- **Database**: MySQL with Sequelize ORM

## Troubleshooting

### Docker daemon not running
Make sure Docker Desktop is running before executing `docker-compose up`.

### Port already in use
If ports 3000, 5000, or 3306 are in use, modify the ports in `.env`:
```
FRONTEND_PORT=3001
BACKEND_PORT=5001
MYSQL_PORT=3307
```

### Permission errors on Linux
If you encounter permission issues with volumes:
```bash
sudo chown -R $USER:$USER backend/uploads
```

### MySQL connection failed
Wait for MySQL to be fully initialized (may take 30-60 seconds on first run). Check logs:
```bash
docker-compose logs mysql
```

## Development Notes

- This is a development setup with hot-reload enabled
- Uploaded images persist in named Docker volume `product_submission_uploads`
- Database data persists in named Docker volume `product_submission_mysql_data`
- NOT production-ready (no HTTPS, development secrets, etc.)

## License

MIT License
