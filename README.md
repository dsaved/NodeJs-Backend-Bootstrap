# Node.js Backend Bootstrap CLI

🚀 A powerful CLI tool to quickly scaffold Node.js backend projects with your preferred technology stack.

## ✨ Key Features

### 📋 **Template Options**

- **Basic Template** - Customizable Node.js project with framework selection
- **NestJS Template** - Modern NestJS application with essential features
- **BTL Template (Enterprise NestJS)** - Production-ready NestJS application with enterprise features

### 🛠️ **Framework Support**

- **Express.js** - Fast, unopinionated web framework *(Basic Template)*
- **Fastify** - High-performance, low-overhead framework *(Basic Template)*
- **Koa.js** - Modern, lightweight framework *(Basic Template)*
- **NestJS** - Progressive Node.js framework *(NestJS & BTL Templates)*

### 🗄️ **Database & ORM**

- **Databases**: PostgreSQL, MySQL, MSSQL, MongoDB, SQLite
- **ORMs**: TypeORM *(NestJS & BTL Templates)*, Sequelize, Prisma *(Basic Template)*
- **Auto-configuration** with environment variables and connection strings
- **Database-specific optimizations** (connection strings for MongoDB/SQLite, standard configs for SQL databases)

### 🔐 **Authentication**

- **JWT Authentication** with bcrypt password hashing
- **X-Signature Authentication** for API security *(NestJS & BTL Templates)*
- **Configurable guards** and middleware
- **Mutual exclusivity** - Choose between authentication methods based on your needs

### 🔧 **Development Features**

- **TypeScript/JavaScript** support *(Basic Template)*
- **TypeScript** by default *(NestJS & BTL Templates)*
- **Request Validation** (Joi, Zod, class-validator)
- **Logging** with Winston *(Basic Template)* or NestJS Logger
- **Comprehensive Testing** with Jest and coverage reporting
- **PM2 Process Management** OR **Docker** configuration *(mutually exclusive)*
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
2. **Template type** - Basic, NestJS, or BTL (Enterprise NestJS)
3. **Framework** - Express.js, Fastify, Koa.js *(Basic Template only)*
4. **Database** - PostgreSQL, MySQL, MSSQL, MongoDB, SQLite
5. **ORM** - TypeORM, Sequelize, Prisma *(Basic Template only)*
6. **Language** - TypeScript or JavaScript *(Basic Template only)*
7. **Authentication** - JWT and/or X-Signature options
8. **Process Management** - PM2 tools *(NestJS & BTL Templates)*
9. **Testing Setup** - Comprehensive unit testing *(NestJS & BTL Templates)*
10. **Deployment** - Docker configuration (when PM2 is not selected)

### After Generation

```bash
# Navigate to your project
cd your-app-name

# Basic Template
npm run dev

# NestJS Template
npm run start:dev

# BTL Template (Enterprise NestJS)
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

### NestJS Template Structure

```text
my-app/
├── src/
│   ├── app.module.ts        # Main application module
│   ├── app.controller.ts    # Application controller
│   ├── app.service.ts       # Application service
│   ├── auth/               # Authentication module (if enabled)
│   ├── users/              # Users module (if auth enabled)
│   └── config/             # Configuration files
├── test/                   # E2E tests
├── .env.example           # Environment template
├── ecosystem.config.cjs   # PM2 configuration (if enabled)
└── package.json           # Dependencies
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

### NestJS Template

- `npm run start:dev` - Start development server
- `npm run start:prod` - Start production server
- `npm run build` - Build application
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage
- `npm run migration:run` - Run database migrations
- `npm run pm2:start` - Start with PM2 (if enabled)
- `npm run pm2:stop` - Stop PM2 processes (if enabled)

### BTL Template

- `make install` - Install all dependencies
- `make dev-start` - Start development server
- `make db-migrate-up` - Run database migrations
- `make db-seeder-run` - Run database seeders
- `make email-test` - Test email service
- `make test` - Run comprehensive unit tests (if enabled)
- `make pm2-start` - Start with PM2 (if enabled)
- `make pm2-stop` - Stop PM2 processes (if enabled)

## ⚙️ Configuration

### Environment Variables

Each generated project includes a `.env.example` file with database-specific configurations:

**Basic Template:**

```env
NODE_ENV=development
PORT=3000

# Database Configuration (auto-configured based on selection)
DB_HOST=localhost
DB_PORT=5432                 # 5432 for PostgreSQL, 3306 for MySQL, 1433 for MSSQL, 27017 for MongoDB
DB_USERNAME=postgres         # postgres, root, sa, or admin based on database
DB_PASSWORD=password
DB_NAME=myapp               # myapp.db for SQLite
DATABASE_URL=...            # Connection string for MongoDB/SQLite

# JWT (if enabled)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

**NestJS Template:**

```env
APP_NAME=my-app
NODE_ENV=development
PORT=3000

# Database Configuration (auto-configured based on selection)
DB_HOST=localhost
DB_PORT=5432                 # Database-specific ports
DB_USERNAME=postgres         # Database-specific usernames
DB_PASSWORD=password
DB_NAME=myapp
DATABASE_URL=...            # For MongoDB/SQLite

# Authentication (configurable)
JWT_SECRET=your-jwt-secret          # If JWT enabled
JWT_EXPIRES_IN=7d                   # If JWT enabled
PRE_SHARED_API_KEY=your-api-key     # If X-Signature enabled
```

**BTL Template:**

```env
APP_NAME=my-app
NODE_ENV=development
PORT=3000

# Database Configuration (auto-configured based on selection)
DB_HOST=localhost
DB_PORT=5432                 # Database-specific ports
DB_USERNAME=postgres         # Database-specific usernames
DB_PASSWORD=password
DB_NAME=myapp
DATABASE_URL=...            # For MongoDB/SQLite

# Authentication (configurable)
JWT_SECRET=your-jwt-secret          # If JWT enabled
JWT_API_SECRET=your-api-secret      # If JWT enabled
PRE_SHARED_API_KEY=your-x-signature-key  # If X-Signature enabled

# Email Service
EMAIL_SERVICE_URL=http://localhost:3001
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🏗️ Template Features Comparison

### Basic Template
- ✅ **Framework Choice** - Express.js, Fastify, Koa.js
- ✅ **Language Choice** - TypeScript or JavaScript
- ✅ **ORM Options** - TypeORM, Sequelize, Prisma, or None
- ✅ **Database Support** - All databases with auto-configuration
- ✅ **Authentication** - JWT with bcrypt
- ✅ **Validation** - Joi, Zod, or class-validator
- ✅ **Logging** - Winston integration
- ✅ **Testing** - Jest setup with basic tests
- ✅ **Docker** - Optional container configuration

### NestJS Template
- ✅ **Modern NestJS** - Latest version with TypeScript
- ✅ **Database Support** - All databases with auto-configuration
- ✅ **Authentication** - JWT and/or X-Signature (configurable)
- ✅ **Validation** - Built-in class-validator and pipes
- ✅ **Testing** - Comprehensive Jest setup with unit & e2e tests
- ✅ **PM2 Support** - Process management (optional)
- ✅ **Guards & Middleware** - Request/response interceptors
- ✅ **Modular Architecture** - Feature-based module structure

### BTL Template (Enterprise NestJS)

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

The ORM implementation includes comprehensive validation and testing through the implementation itself:

- ✅ ORM model structure validation
- ✅ Template integrity checks  
- ✅ Dependency management verification
- ✅ End-to-end workflow testing
- ✅ All template types (Basic, NestJS, BTL)
- ✅ Authentication customization (JWT/X-Signature)
- ✅ Database configuration for all supported databases
- ✅ PM2/Docker mutual exclusivity
- ✅ Comprehensive unit testing generation

## 🆕 Recent Updates & Improvements

### v2.0.0 - Template Restructuring & Enhanced Database Support

**🏗️ Major Template Restructuring:**
- **Added NestJS Template** - New standalone NestJS template option
- **Enhanced BTL Template** - Now called "BTL Template (Enterprise NestJS)"
- **Template Organization** - Moved to `template/basic/`, `template/nestjs/`, `template/btl-template/`

**🗄️ Comprehensive Database Support:**
- **Complete Database Coverage** - All 5 databases (PostgreSQL, MySQL, MSSQL, MongoDB, SQLite) now fully supported
- **Database-Specific Configuration** - Auto-configured ports, usernames, and connection strings
- **Smart Environment Setup** - MongoDB gets connection strings, SQLite gets file paths, SQL databases get standard configs
- **Template Consistency** - All templates now have identical database support

**⚙️ Enhanced Development Experience:**
- **PM2 vs Docker Exclusivity** - Choose process management OR containerization, not both
- **Comprehensive Testing** - Auto-generated unit tests with coverage thresholds
- **Improved Configuration** - Smarter environment variable management based on selections

**🔐 Authentication Improvements:**
- **Flexible Auth Options** - Choose JWT and/or X-Signature independently
- **Template-Specific Auth** - Basic template gets JWT, NestJS/BTL get both options
- **Conditional Configuration** - Auth guards and modules adapt to your selections

**🧪 Testing & Quality:**
- **Jest Integration** - Comprehensive test suites for all templates
- **Coverage Reporting** - 80% coverage thresholds with HTML reports
- **E2E Testing** - End-to-end tests for NestJS and BTL templates
- **Template-Specific Tests** - Tests adapted to your feature selections

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
