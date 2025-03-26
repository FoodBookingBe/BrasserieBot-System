# BrasserieBot - AI-Driven Hospitality Operating System

[![Netlify Status](https://api.netlify.com/api/v1/badges/54f0d686-505e-42c9-a1e4-bd88412d859c/deploy-status)](https://app.netlify.com/sites/foodbookingai/deploys)

BrasserieBot is a comprehensive AI-powered platform designed to revolutionize restaurant operations. This system provides a complete solution for hospitality businesses, leveraging artificial intelligence to optimize operations, increase profitability, and enhance customer experience.

## Core Features

### 1. Modular Dashboard System
- Customizable interface tailored to specific restaurant needs
- Real-time analytics and reporting
- Role-based access control for different staff members

### 2. AI Business Advisor
- Powered by Claude API
- Data-driven insights and recommendations
- Menu optimization suggestions
- Staffing and inventory recommendations
- Pricing strategy analysis

### 3. Universal Integration Hub
- Seamless connections with third-party services
- POS system integration
- Delivery platform connections
- Accounting software compatibility
- Reservation system integration

### 4. Guaranteed Supplier Payment System
- Automated payment processing
- Payment tracking and reporting
- Supplier relationship management
- Invoice reconciliation

## Technology Stack

### Backend
- NestJS with TypeScript
- PostgreSQL database with Prisma ORM
- RESTful API architecture
- JWT-based authentication
- Claude API integration for AI capabilities

### Frontend
- Next.js with TypeScript
- Tailwind CSS for styling
- Responsive design for all devices
- Interactive dashboard components
- Real-time data visualization

### Infrastructure
- Docker containerization
- Kubernetes orchestration
- CI/CD with GitHub Actions
- Google Cloud Platform deployment
- Scalable microservices architecture

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/BrasserieBot.git
cd BrasserieBot
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

3. Start the development environment:
```bash
docker-compose up -d
```

4. Install dependencies and run the backend:
```bash
cd backend
npm install
npm run start:dev
```

5. Install dependencies and run the frontend:
```bash
cd frontend
npm install
npm run dev
```

6. Access the application:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## Development

### Backend Development
```bash
cd backend
npm run start:dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database Management
```bash
cd backend
npx prisma studio
```

### Running Tests
```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## Deployment

### Production Build
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Docker Deployment
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Claude API for AI capabilities
- The NestJS and Next.js communities for excellent documentation
- All contributors who have helped shape this project