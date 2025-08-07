# Node.js Backend Bootstrap CLI

🚀 A powerful CLI tool to quickly scaffold Node.js backend projects with your preferred technology stack.

## ✨ Key Features

### 📋 **Template Options**

- **Basic Template** - Customizable Node.js project with framework selection
- **BTL Template** - Production-ready NestJS application with enterprise features

### 🛠️ **Framework Support**

- **Express.js** - Fast, unopinionated web framework
- **Fastify** - High-performance, low-overhead framework  
- **Koa.js** - Modern, lightweight framework
- **NestJS** - Progressive Node.js framework (BTL Template)

### 🗄️ **Database & ORM**

- **Databases**: PostgreSQL, MySQL, MongoDB, SQLite, MSSQL
- **ORMs**: TypeORM, Sequelize, Prisma
- **Auto-configuration** with environment variables

### 🔐 **Authentication**

- **JWT Authentication** with bcrypt password hashing
- **X-Signature Authentication** for API security (BTL Template)
- **Configurable guards** and middleware

### 🔧 **Development Features**

- **TypeScript/JavaScript** support
- **Request Validation** (Joi, Zod, class-validator)
- **Logging** with Winston
- **Testing** with Jest
- **Docker** configuration
- **ESLint & Prettier** setup

## 🚀 Installation & Usage

### Quick Start

```bash
# Clone the repository
git clone https://github.com/dsaved/NodeJs-Backend-Bootstrap.git
cd NodeJs-Backend-Bootstrap

# Install dependencies
npm install

# Run the CLI
node init.js
```

### Interactive Setup

The CLI will guide you through project configuration:

1. **Application name** - Your project name
2. **Template type** - Basic or BTL (NestJS)
3. **Framework** - Express.js, Fastify, Koa.js *(Basic Template)*
4. **Database** - PostgreSQL, MySQL, MongoDB, SQLite, MSSQL
5. **ORM** - TypeORM, Sequelize, Prisma *(Basic Template)*
6. **Language** - TypeScript or JavaScript *(Basic Template)*
7. **Authentication** - JWT, X-Signature options
8. **Features** - Logging, Validation, Testing, Docker

### After Generation

```bash
# Navigate to your project
cd your-app-name

# Basic Template
npm run dev

# BTL Template (NestJS)
make dev-start
```

## 📁 Project Structure

### Basic Template Structure

```text
my-app/
├── src/
│   ├── index.ts/js           # Main application entry
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── config/               # Configuration files
│   └── utils/                # Utility functions
├── tests/                    # Test files
├── .env.example             # Environment template
├── docker-compose.yml       # Docker configuration
└── package.json             # Dependencies
```

### BTL Template Structure

```text
my-app/
├── api/                     # Main NestJS application
│   ├── src/
│   │   ├── api/            # Feature modules
│   │   ├── app-guards/     # Authentication guards
│   │   └── constructs/     # Configuration
├── email-service/          # Email microservice
├── Makefile               # Development commands
└── docker-compose.yml     # Docker setup
```

## 🛠️ Available Commands

### Basic Template

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm run build` - Build TypeScript projects
- `npm test` - Run tests
- `npm run lint` - Run linting

### BTL Template

- `make install` - Install all dependencies
- `make dev-start` - Start development server
- `make db-migrate-up` - Run database migrations
- `make db-seeder-run` - Run database seeders
- `make email-test` - Test email service

## ⚙️ Configuration

### Environment Variables

Each generated project includes a `.env.example` file with:

**Basic Template:**

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=myapp

# JWT (if enabled)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

**BTL Template:**

```env
APP_NAME=my-app
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=myapp

# Authentication
JWT_SECRET=your-jwt-secret
PRE_SHARED_API_KEY=your-x-signature-key

# Email Service
EMAIL_SERVICE_URL=http://localhost:3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🏗️ BTL Template Features

The BTL Template is a production-ready NestJS application that includes:

### Core Features

- **NestJS Framework** with TypeScript
- **TypeORM** with database migrations and seeders
- **Multi-service Architecture** (API + Email Service)
- **Makefile Integration** for easy command management

### Authentication & Security

- **JWT Authentication** with Passport
- **X-Signature Authentication** with SHA256 validation
- **Helmet Security Headers**
- **CORS Configuration**
- **Request Validation** with class-validator

### Built-in Modules

- **User Management** with role-based access control
- **Email Notifications** service
- **File Upload** with AWS S3 integration
- **Audit Logging** and request tracking
- **OTP Management** for two-factor authentication

### Development Tools

- **Database Migrations** and seeders
- **API Documentation** generation
- **Comprehensive Error Handling**
- **Request Logging Middleware**
- **Environment-based Configuration**

## 🧪 Testing

This CLI includes comprehensive tests to ensure functionality:

```bash
# Basic CLI structure validation
node test-cli.js

# BTL Template comprehensive testing
node test-btl-cli.js
```

**Test Coverage:**

- ✅ CLI Structure validation
- ✅ Template integrity checks
- ✅ BTL Template with Makefile integration
- ✅ Authentication customization
- ✅ Database configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the generated project's README.md
2. Review environment variables in `.env.example`
3. Ensure all dependencies are installed
4. Create an issue with detailed information

---

**Happy Coding!** 🚀
