# Node.js Project Bootstrapper

A powerful CLI tool to quickly scaffold Node.js projects with your preferred technology stack.

## Features

✅ **Multiple Templates**: Basic Template & BTL Template (NestJS)
✅ **Multiple Frameworks**: Express.js, Fastify, Koa.js (Basic Template)
✅ **Language Support**: TypeScript & JavaScript (Basic Template)  
✅ **ORM Integration**: TypeORM, Sequelize, Prisma (Basic Template)
✅ **Database Support**: PostgreSQL, MySQL, MSSQL, MongoDB, SQLite
✅ **Authentication**: JWT & X-Signature (BTL Template), JWT-based auth setup (Basic Template)
✅ **Logging**: Winston logger integration (Basic Template), Built-in logging (BTL Template)
✅ **Validation**: Request validation setup (Joi, Zod, class-validator) (Basic Template), class-validator (BTL Template)
✅ **Testing**: Jest testing framework (Basic Template)
✅ **Docker**: Optional Docker configuration
✅ **TypeScript**: Full TypeScript support with proper types

## Installation

### Global Installation (Recommended)

```bash
# Install globally
npm install -g project-bootstrapper

# Use anywhere
init-project
```

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd bootstrap

# Install dependencies
npm install

# Link globally for development
npm link

# Now you can use the CLI
init-project
```

## Usage

Simply run the command and follow the interactive prompts:

```bash
init-project
```

The CLI will ask you about:

1. **Template** - Basic Template or BTL Template (NestJS)
2. **Application name** - Your project name
3. **Framework** - Express.js, Fastify, or Koa.js (Basic Template only)
4. **ORM** - TypeORM, Sequelize, Prisma, or None (Basic Template only)
5. **Database** - PostgreSQL, MySQL, MSSQL, MongoDB, or SQLite
6. **Language** - TypeScript or JavaScript (Basic Template only)
7. **Authentication Options**:
   - Basic Template: JWT Authentication
   - BTL Template: JWT Authentication and/or X-Signature Authentication
8. **Features** - Logging, Validation, Testing, Docker (varies by template)

## Generated Project Structure

```
my-app/
├── src/
│   ├── index.ts/js           # Main application entry
│   ├── routes/               # API routes
│   │   └── auth.ts/js        # Authentication routes (if enabled)
│   ├── middleware/           # Custom middleware
│   │   └── auth.ts/js        # Auth middleware (if enabled)
│   ├── config/               # Configuration files
│   │   └── database.ts/js    # Database configuration
│   └── utils/                # Utility functions
│       └── logger.ts/js      # Winston logger (if enabled)
├── prisma/                   # Prisma schema (if Prisma selected)
├── docker-compose.yml        # Docker configuration (if enabled)
├── Dockerfile                # Docker configuration (if enabled)
├── tsconfig.json             # TypeScript config (if TypeScript)
├── .env.example              # Environment variables template
├── .env                      # Environment variables
├── .gitignore                # Git ignore rules
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## Quick Start

After generating your project:

```bash
# Navigate to your project
cd my-app

# Start development server
npm run dev

# For Docker setup (if enabled)
docker-compose up
```

## Available Scripts

Generated projects include these npm scripts:

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm run build` - Build TypeScript projects
- `npm test` - Run tests (if testing enabled)
- `npm run lint` - Run linting

## Environment Variables

Each generated project includes a comprehensive `.env.example` file with:

- Database connection strings
- JWT secrets (if auth enabled)
- Port configuration
- Environment-specific settings

## Technology Stack Options

### Templates

- **Basic Template** - Customizable Node.js project with framework selection
- **BTL Template (NestJS)** - Enterprise-ready NestJS application with built-in modules

### BTL Template Features

The BTL Template is a production-ready NestJS application that includes:

- **NestJS Framework** with TypeScript
- **TypeORM** with database migrations and seeders
- **Configurable Authentication**:
  - JWT Authentication with Passport
  - X-Signature Authentication with SHA256 validation
- **Built-in Modules**:
  - User management
  - Role-based access control
  - File upload (AWS S3 integration)
  - Email notifications
  - Audit logging
- **Security Features**:
  - Helmet security headers
  - CORS configuration
  - Request validation with class-validator
  - Environment-based configuration
- **Development Tools**:
  - Database migrations and seeders
  - API documentation
  - Comprehensive error handling
  - Request logging middleware

### Frameworks
- **Express.js** - Fast, unopinionated web framework
- **Fastify** - Fast and low overhead web framework
- **Koa.js** - Modern, lightweight web framework

### ORMs
- **TypeORM** - Feature-rich ORM with TypeScript support
- **Sequelize** - Mature, feature-rich ORM
- **Prisma** - Modern database toolkit with type safety
- **None** - No ORM, manual database handling

### Databases
- **PostgreSQL** - Advanced open-source relational database
- **MySQL** - Popular relational database
- **MSSQL** - Microsoft SQL Server
- **MongoDB** - NoSQL document database
- **SQLite** - Lightweight, serverless database

## Features in Detail

### Authentication
- JWT-based authentication
- Registration and login endpoints
- Password hashing with bcrypt
- Auth middleware for protected routes
- TypeScript interfaces for auth

### Logging
- Winston logger integration
- Multiple transport options
- Environment-specific log levels
- Error logging and tracking

### Validation

- **Joi** - Object schema validation library
- **Zod** - TypeScript-first schema validation with static type inference
- **class-validator** - Decorator-based validation for classes, works great with TypeScript

### Testing
- Jest testing framework
- Supertest for API testing
- TypeScript support for tests
- Basic test structure

### Docker
- Multi-stage Dockerfile
- Docker Compose with database services
- Development and production configurations
- Volume mounting for development

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## Development Testing

This CLI tool includes comprehensive tests to ensure functionality:

### Available Tests

```bash
# Basic CLI structure validation
node test-cli.js

# BTL Template comprehensive testing
node test-btl-cli.js
```

### Test Coverage

- ✅ **CLI Structure**: Validates all required files and configuration
- ✅ **Template Integrity**: Ensures all template files are present
- ✅ **BTL Template**: Tests full BTL template with Makefile integration
- ✅ **Customization**: Verifies all customizations are applied correctly
- ✅ **Makefile**: Tests all Makefile commands and syntax validation

## Publishing

To publish this CLI tool to npm:

```bash
# Update package.json with unique name and version
npm login
npm publish
```

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions:

1. Check the generated project's README.md
2. Review the environment variables in .env.example
3. Ensure all dependencies are installed
4. Check the logs for error messages

---

**Happy Coding!** 🚀
