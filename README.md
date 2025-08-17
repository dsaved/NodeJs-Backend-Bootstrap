# Node.js Backend Bootstrap CLI

🚀 A powerful CLI tool to quickly scaffold Node.js backend pro## 🛠️ Development Setup (For Contributors)

**Prerequisites:** Node.js 22.0.0 or higher

If you want to contribute to this project or run it locally:ts with your preferred technology stack.

## 🚀 Quick Start

### Prerequisites

- **Node.js 22.0.0 or higher** is required to run this CLI tool

### Installation

Install globally via npm:

```bash
npm install -g nodejs-bootstrapper
```

### Usage

After installation, you can create a new project anywhere:

```bash
# Create a new project
init-project

# Or use with npx (no installation required)
npx nodejs-bootstrapper
```

The CLI will guide you through an interactive setup to configure your project with:
- **Template selection** (Basic, NestJS, or Enterprise API)
- **Framework choice** (Express, Fastify, Koa, NestJS)
- **Database & ORM** (PostgreSQL, MySQL, MongoDB, etc. with TypeORM, Sequelize, or Prisma)
- **Authentication options** (JWT, X-Signature)
- **Development tools** (TypeScript/JavaScript, testing, Docker, PM2)
- **GitHub Actions** (Code quality checks, naming conventions, spell checking, security)

### Comprehensive Usage Examples

#### Example 1: Basic Express.js API with Full GitHub Checks

```bash
$ init-project
? Enter the application name: ecommerce-api
? Select the project template: Basic Template
? Select the framework: Express.js
? Select the ORM: TypeORM
? Select the database type: PostgreSQL
? Select the language: TypeScript
? Do you want authentication (JWT)? Yes
? Do you want logging (Winston)? Yes
? Do you want request validation? Yes
? Select validation library: Joi
? Do you want testing setup (Jest)? Yes
? Do you want Docker configuration? Yes
? Do you want GitHub Actions for code quality checks? Yes
? Select GitHub check types: 
  ✅ Code Quality (ESLint, Prettier)
  ✅ Naming Conventions
  ✅ Spell Checking
  ✅ Security Scanning
  ✅ Test Coverage

📦 Scaffolding project: ecommerce-api
🔄 Copying template files...
🔧 Creating GitHub workflows...
✅ GitHub workflows created
📥 Installing dependencies...

✅ Project initialized successfully!

📋 Next steps:
   cd ecommerce-api
   npm run dev

🔍 GitHub Checks Configuration:
   ✅ GitHub Actions workflows created
   ✅ Code Quality checks (ESLint, Prettier)
   ✅ Naming Convention validation
   ✅ Spell checking
   ✅ Security scanning
   ✅ Test coverage reporting

📝 GitHub Setup:
   • Push your code to GitHub repository
   • Enable GitHub Actions in repository settings
   • Add OSV Scanner and Trivy configuration for security scanning
   • Test coverage reporting is built-in (no Codecov required)
   • Review .github/CODEOWNERS for team assignments
```

#### Example 2: NestJS Microservice with JWT Authentication

```bash
$ init-project
? Enter the application name: user-service
? Select the project template: NestJS Template
? Select the ORM: TypeORM
? Select the database type: PostgreSQL
? Do you want JWT authentication? Yes
? Do you want X-Signature authentication? No
? Do you want PM2 process management tools? Yes
? Do you want comprehensive unit testing setup? Yes
? Do you want GitHub Actions for code quality checks? Yes
? Select GitHub check types: 
  ✅ Code Quality (ESLint, Prettier)
  ✅ Naming Conventions
  ✅ Test Coverage

📦 Scaffolding project: user-service
🔄 Copying template files...
🔄 Setting up TypeORM models...
✅ Copied TypeORM models to ./src/model/
🔧 Creating GitHub workflows...
✅ GitHub workflows created
📥 Installing dependencies...

✅ Project initialized successfully!

📋 Next steps:
   cd user-service
   npm run start:dev

🔧 Configuration:
   ✅ JWT Authentication enabled
   ❌ X-Signature Authentication disabled
   ✅ PM2 Process Management enabled
   ✅ Comprehensive Unit Testing enabled

📝 Don't forget to:
   • Update .env file with your database credentials
   • Set JWT_SECRET in .env for JWT auth
   • Configure PM2 settings in ecosystem.config.cjs

🛠️  Available commands:
   • npm run start:dev - Start development server
   • npm run build - Build for production
   • npm run migration:run - Run database migrations
   • npm run test - Run unit tests
   • npm run test:e2e - Run end-to-end tests
   • npm run test:cov - Run tests with coverage
   • npm run pm2:start - Start with PM2
   • npm run pm2:stop - Stop PM2 processes

🔍 GitHub Checks Configuration:
   ✅ GitHub Actions workflows created
   ✅ Code Quality checks (ESLint, Prettier)
   ✅ Naming Convention validation
   ✅ Test coverage reporting
```

#### Example 3: Enterprise API with Full Security Stack

```bash
$ init-project
? Enter the application name: enterprise-platform
? Select the project template: Enterprise API (NestJS)
? Select the ORM: TypeORM
? Select the database type: PostgreSQL
? Do you want JWT authentication? Yes
? Do you want X-Signature authentication? Yes
? Do you want PM2 process management tools? No
? Do you want comprehensive unit testing setup? Yes
? Do you want Docker configuration? Yes
? Do you want GitHub Actions for code quality checks? Yes
? Select GitHub check types: 
  ✅ Code Quality (ESLint, Prettier)
  ✅ Naming Conventions
  ✅ Spell Checking
  ✅ Security Scanning
  ✅ Test Coverage

📦 Scaffolding project: enterprise-platform
🔄 Copying template files...
🔄 Setting up TypeORM models...
✅ Copied TypeORM models to api/src/model/
🧹 Cleaned up unused ORM folders
🔄 Generating initial migration for TypeORM...
✅ Initial migration generated for TypeORM
🔧 Creating GitHub workflows...
✅ GitHub workflows created
📥 Installing dependencies...

✅ Project initialized successfully!

📋 Next steps:
   cd enterprise-platform
   make dev-start

� Configuration:
   ✅ JWT Authentication enabled
   ✅ X-Signature Authentication enabled
   ✅ Comprehensive Unit Testing enabled

📝 Don't forget to:
   • Update api/.env file with your database credentials
   • Run migrations: make db-migrate-up
   • Run seeders: make db-seeder-run
   • Set PRE_SHARED_API_KEY in api/.env for X-Signature auth
   • Set JWT_SECRET in api/.env for JWT auth

🛠️  Available Makefile commands:
   • make install - Install dependencies for all services
   • make dev-start - Start development server
   • make db-migrate-up - Run database migrations
   • make db-seeder-run - Run database seeders
   • make email-test - Test email service
   • make test - Run comprehensive unit tests

🔍 GitHub Checks Configuration:
   ✅ GitHub Actions workflows created
   ✅ Code Quality checks (ESLint, Prettier)
   ✅ Naming Convention validation
   ✅ Spell checking
   ✅ Security scanning
   ✅ Test coverage reporting

📝 GitHub Setup:
   • Push your code to GitHub repository
   • Enable GitHub Actions in repository settings
   • Add OSV Scanner and Trivy configuration for security scanning
   • Test coverage reporting is built-in (no Codecov required)
   • Review .github/CODEOWNERS for team assignments
```

### Generated GitHub Workflows

When you enable GitHub Actions, the following workflows are automatically created:

#### CI Workflow (`.github/workflows/ci.yml`)
```yaml
name: CI
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]  # Basic Template
        # OR node-version: [18.x, 20.x]   # NestJS/Enterprise Templates
    
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run ESLint
      run: npm run lint:check
    
    - name: Run Prettier Check
      run: npm run format:check
    
    - name: Run Tests with Coverage
      run: npm run test:coverage  # Basic Template
      # OR: npm run test:cov      # NestJS/Enterprise Templates
    
   # Coverage is reported in the workflow output (no Codecov required)
```

#### Naming Conventions Workflow
- Validates kebab-case file naming
- Checks directory naming conventions
- Prevents console.log statements
- Detects hardcoded secrets
- Validates API endpoint naming

#### Spell Check Workflow
- Checks spelling in code, comments, and documentation
- Configurable word dictionary
- Ignores technical terms and project-specific words

#### Security Workflow (if enabled)
   - OSV Scanner and Trivy vulnerability scanning
- Dependency security checks
- SARIF upload to GitHub Security tab

### GitHub Repository Setup

After creating your project:

1. **Initialize Git and push to GitHub**:
   ```bash
   cd your-project-name
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-project-name.git
   git push -u origin main
   ```

2. **Configure repository settings**:
   - Enable GitHub Actions in repository settings
   - Add required secrets in Settings > Secrets and variables > Actions:
   - See [Trivy GitHub Action docs](https://github.com/aquasecurity/trivy-action) for configuration
    - Configure branch protection rules for `main` branch
    - Require status checks to pass before merging

### GitHub Checks in Action

When you create a pull request, you'll see status checks like:

```
✅ CI / test (16.x) 
✅ CI / test (18.x)
✅ CI / test (20.x)
✅ Naming Conventions / naming-conventions
✅ Spell Check / spelling
✅ Security / osv-scanner (if enabled)
✅ Security / trivy (if enabled)
```

These checks ensure:
- Code builds successfully across Node.js versions
- All tests pass with adequate coverage
- Code follows naming conventions
- No spelling errors in code/docs
- No security vulnerabilities
- Code is properly formatted

## ✨ Key Features

### 📋 **Template Options**

- **Basic Template** - Customizable Node.js project with framework selection
- **NestJS Template** - Modern NestJS application with essential features
- **Enterprise API (NestJS)** - Production-ready NestJS application with enterprise features

### 🛠️ **Framework Support**

- **Express.js** - Fast, unopinionated web framework *(Basic Template)*
- **Fastify** - High-performance, low-overhead framework *(Basic Template)*
- **Koa.js** - Modern, lightweight framework *(Basic Template)*
- **NestJS** - Progressive Node.js framework *(NestJS & Enterprise API Templates)*

### 🗄️ **Database & ORM**

- **Databases**: PostgreSQL, MySQL, MSSQL, MongoDB, SQLite
- **ORMs**: TypeORM *(NestJS & Enterprise API Templates)*, Sequelize, Prisma *(Basic Template)*
- **Auto-configuration** with environment variables and connection strings
- **Database-specific optimizations** (connection strings for MongoDB/SQLite, standard configs for SQL databases)

### 🔐 **Authentication**

- **JWT Authentication** with bcrypt password hashing
- **X-Signature Authentication** for API security *(NestJS & Enterprise API Templates)*
- **Configurable guards** and middleware
- **Mutual exclusivity** - Choose between authentication methods based on your needs

### 🔧 **Development Features**

- **TypeScript/JavaScript** support *(Basic Template)*
- **TypeScript** by default *(NestJS & Enterprise API Templates)*
- **Request Validation** (Joi, Zod, class-validator)
- **Logging** with Winston *(Basic Template)* or NestJS Logger
- **PM2 Process Management** OR **Docker** configuration *(mutually exclusive)*
- **ESLint & Prettier** setup

### 🤖 **GitHub Actions & Code Quality**

- **Automated CI/CD** workflows for all templates
- **Code Quality Checks** with ESLint and Prettier
- **Naming Convention Validation** (kebab-case files, PascalCase classes, camelCase variables)
- **Spell Checking** in code, comments, and documentation
- **Security Scanning** with OSV Scanner and Trivy
- **Test Coverage Reporting** (built-in, no Codecov required)
- **Multi-Node.js Version Testing** (16.x, 18.x, 20.x for Basic; 18.x, 20.x for NestJS/Enterprise)
- **Template-Specific Workflows** optimized for each project type
- **Branch Protection** with required status checks
- **Pull Request Templates** with quality checklists

## �️ Development Setup (For Contributors)

If you want to contribute to this project or run it locally:

```bash
# Clone the repository
git clone https://github.com/dsaved/NodeJs-Backend-Bootstrap.git
cd NodeJs-Backend-Bootstrap

# Install dependencies
npm install

# Run the CLI locally
node src/init.js
```

### Interactive Setup

The CLI will guide you through project configuration:

1. **Application name** - Your project name
2. **Template type** - Basic, NestJS, or Enterprise API
3. **Framework** - Express.js, Fastify, Koa.js *(Basic Template only)*
4. **Database** - PostgreSQL, MySQL, MSSQL, MongoDB, SQLite
5. **ORM** - TypeORM, Sequelize, Prisma *(Basic Template only)*
6. **Language** - TypeScript or JavaScript *(Basic Template only)*
7. **Authentication** - JWT and/or X-Signature options
8. **Process Management** - PM2 tools *(NestJS & Enterprise API Templates)*
9. **Testing Setup** - Comprehensive unit testing *(NestJS & Enterprise API Templates)*
10. **Deployment** - Docker configuration (when PM2 is not selected)
11. **GitHub Actions** - Code quality checks and CI/CD workflows
12. **Check Types** - Choose specific GitHub checks to enable:
    - **Code Quality** (ESLint, Prettier)
    - **Naming Conventions** (File/folder naming validation)
    - **Spell Checking** (Code and documentation spell check)
   - **Security Scanning** (OSV Scanner and Trivy)
   - **Test Coverage** (built-in, no Codecov required)

### After Generation

```bash
# Navigate to your project
cd your-app-name

# Basic Template
npm run dev

# NestJS Template
npm run start:dev

# Enterprise API (NestJS)
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

### Enterprise API Structure

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

### Enterprise API

- `make install` - Install all dependencies
- `make dev-start` - Start development server
- `make db-migrate-up` - Run database migrations
- `make db-seeder-run` - Run database seeders
- `make email-test` - Test email service
- `make test` - Run comprehensive unit tests (if enabled)
- `make pm2-start` - Start with PM2 (if enabled)
- `make pm2-stop` - Stop PM2 processes (if enabled)

## 🔍 GitHub Actions & Code Quality Checks

The Bootstrap CLI now includes comprehensive GitHub Actions workflows for automated code quality assurance. These workflows are template-specific and can be customized during project creation.

### Available Check Types

#### 🧹 Code Quality Checks
- **ESLint** - JavaScript/TypeScript linting with naming convention rules
- **Prettier** - Code formatting consistency checks
- **Build Validation** - Ensures code compiles successfully across Node.js versions

#### 📝 Naming Convention Validation
- **File Naming** - Enforces kebab-case for files (e.g., `user-service.ts`)
- **Directory Naming** - Enforces kebab-case for directories
- **Code Standards** - Prevents `console.log` statements and hardcoded secrets
- **API Endpoints** - Validates RESTful naming conventions

#### 🔤 Spell Checking
- **Code Spelling** - Checks variable names, comments, and strings
- **Documentation** - Validates README, JSDoc comments, and markdown files
- **Custom Dictionary** - Includes technical terms and project-specific words
- **Configurable** - Add project-specific terms to `.cspell.json`

- **Vulnerability Detection** - OSV Scanner and Trivy for dependency and container scanning
- **Secret Detection** - Prevents hardcoded API keys and passwords
- **SARIF Upload** - Security findings appear in GitHub Security tab
- **Severity Thresholds** - Configurable security severity levels

#### 📊 Test Coverage
- **Coverage Reporting** - Built-in coverage reports (no Codecov required)
- **Threshold Enforcement** - Requires minimum coverage percentages
- **Trend Tracking** - Monitor coverage changes over time
- **Pull Request Comments** - Coverage diff in PR comments

### Template-Specific Workflows

#### Basic Template Workflows
```yaml
# Tests across Node.js 16.x, 18.x, 20.x
# ESLint with naming conventions
# Prettier formatting checks
# Jest with coverage reporting
# Security scanning with OSV Scanner and Trivy
```

#### NestJS Template Workflows
```yaml
# Tests across Node.js 18.x, 20.x
# Database integration testing (PostgreSQL service)
# NestJS-specific linting rules
# E2E and unit test coverage
# Advanced naming convention validation
```

#### Enterprise API Workflows
```yaml
# Multi-service testing (API + Email Service)
# Microservice-specific checks
# Makefile command validation
# Enhanced security scanning
# Service dependency validation
```

### Generated GitHub Files

When you enable GitHub Actions, the following files are created:

```
.github/
├── workflows/
│   ├── ci.yml                    # Main CI/CD pipeline
│   ├── naming-conventions.yml    # Naming validation
│   └── spell-check.yml          # Spell checking
├── CODEOWNERS                   # Code ownership assignments
└── pull_request_template.md     # PR template with checklist
```

### Repository Setup Checklist

After creating your project and pushing to GitHub:

1. **Enable GitHub Actions**
   - Go to repository Settings > Actions > General
   - Allow GitHub Actions to run

2. **Add Required Secrets**
   - See Trivy and OSV Scanner documentation for any required configuration

3. **Branch Protection**
   - Enable branch protection for `main` branch
   - Require status checks before merging
   - Require pull request reviews

4. **Team Configuration**
   - Update `.github/CODEOWNERS` with your team handles
   - Assign ownership for different parts of the codebase

### Status Check Examples

Pull requests will show status checks like:

```bash
✅ CI / test (16.x)                    # Node.js 16.x tests pass
✅ CI / test (18.x)                    # Node.js 18.x tests pass  
✅ CI / test (20.x)                    # Node.js 20.x tests pass
✅ Naming Conventions                  # File naming is correct
✅ Spell Check                         # No spelling errors
✅ Security                            # No vulnerabilities found
```

### Customization Options

You can customize the workflows by:

- **Editing workflow files** in `.github/workflows/`
- **Updating ESLint rules** in `.eslintrc.js`
- **Adding words** to `.cspell.json` for spell checking
- **Configuring team ownership** in `CODEOWNERS`
- **Adjusting coverage thresholds** in `jest.config.js`

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

**Enterprise API:**

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

### Enterprise API (NestJS)

The Enterprise API is a production-ready NestJS application that includes:

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

### v2.1.0 - GitHub Actions Integration & Code Quality Assurance

**🤖 GitHub Actions & CI/CD:**
- **Automated Workflows** - Template-specific GitHub Actions for CI/CD
- **Code Quality Checks** - ESLint, Prettier, and naming convention validation
- **Security Scanning** - OSV Scanner and Trivy for vulnerability detection
- **Spell Checking** - CSpell integration for code and documentation
- **Test Coverage** - Codecov integration with coverage thresholds
- **Multi-Node Version Testing** - Testing across Node.js 16.x, 18.x, and 20.x
- **Branch Protection** - Automated status checks for pull requests

**📋 Enhanced Developer Experience:**
- **Interactive GitHub Setup** - Choose which checks to enable during project creation
- **Template-Optimized Workflows** - Different CI configurations for Basic, NestJS, and Enterprise templates
- **Code Ownership** - Automatic CODEOWNERS file generation
- **PR Templates** - Standardized pull request descriptions with quality checklists

### v2.0.0 - Template Restructuring & Enhanced Database Support

**🏗️ Major Template Restructuring:**
- **Added NestJS Template** - New standalone NestJS template option
- **Enhanced Enterprise API** - Now called "Enterprise API (NestJS)"
- **Template Organization** - Moved to `template/basic/`, `template/nestjs/`, `template/enterprise-template/`

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
- **E2E Testing** - End-to-end tests for NestJS and Enterprise API templates
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

1. **Verify Node.js version** - Ensure you have Node.js 22.0.0 or higher installed
2. Check the generated project's README.md
3. Review environment variables in `.env.example`
4. Ensure all dependencies are installed
5. Create an issue with detailed information

---

**Happy Coding!** 🚀
