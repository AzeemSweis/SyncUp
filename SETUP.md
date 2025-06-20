# SyncUp Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- AWS Account
- Git/GitHub

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/syncup.git
cd syncup

# Install backend dependencies
cd syncup-backend
npm install

# Install frontend dependencies
cd ../syncup-frontend
npm install
```

### 2. AWS RDS PostgreSQL Setup

#### Option A: Using AWS Console (Recommended)
1. Go to AWS RDS Console
2. Create new PostgreSQL database:
   - **Engine**: PostgreSQL 15+
   - **Template**: Free tier (for development)
   - **DB Instance**: db.t3.micro
   - **Database name**: `syncup`
   - **Username**: `postgres`
   - **Password**: (secure password)
   - **VPC**: Default VPC
   - **Security Group**: Allow inbound on port 5432

#### Option B: Using AWS CLI
```bash
aws rds create-db-instance \
  --db-instance-identifier syncup-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20 \
  --db-name syncup \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --vpc-security-group-ids sg-xxxxxxxxx
```

### 3. Environment Configuration
```bash
cd syncup-backend
cp .env.example .env
```

Update `.env` with your AWS RDS details:
```env
DB_HOST=your-rds-endpoint.us-east-1.rds.amazonaws.com
DB_PASSWORD=your-secure-password
JWT_SECRET=generate-256-bit-random-string
```

### 4. Database Schema Setup
```bash
# Connect to your RDS instance and run:
psql -h your-rds-endpoint.us-east-1.rds.amazonaws.com -U postgres -d syncup -f src/config/database.sql
```

### 5. Run Development Servers
```bash
# Terminal 1: Backend
cd syncup-backend
npm run dev

# Terminal 2: Frontend
cd syncup-frontend
npm start
```

## 🔧 GitHub Setup

### Create Repository
1. Create new repository on GitHub: `syncup`
2. Add remote origin:
```bash
git remote add origin https://github.com/yourusername/syncup.git
git push -u origin main
```

### Environment Secrets
Add these secrets in GitHub Settings > Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DB_HOST`
- `DB_PASSWORD`
- `JWT_SECRET`

## 🚀 Deployment

### Backend Options
- **AWS Elastic Beanstalk**: Easy Node.js deployment
- **AWS Lambda + API Gateway**: Serverless option
- **AWS ECS**: Container-based deployment

### Frontend Options
- **AWS S3 + CloudFront**: Static site hosting
- **AWS Amplify**: Full-stack deployment
- **Vercel/Netlify**: Alternative hosting

## 📝 Next Steps
1. Complete database setup
2. Implement authentication
3. Build API endpoints
4. Create UI components
5. Set up deployment pipeline