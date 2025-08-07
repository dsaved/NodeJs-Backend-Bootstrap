#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const {
  createLoggerFiles,
  createValidationFiles,
  createTestFiles,
} = require("./utils");

async function main() {
  console.log("🚀 Welcome to your custom Node.js project initializer!");
  console.log(
    "This tool will help you scaffold a new Node.js project with your preferred stack.\n"
  );

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "appName",
      message: "Enter the application name:",
      validate: (input) => {
        if (!input.trim()) {
          return "Application name is required";
        }
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return "Application name should only contain letters, numbers, hyphens, and underscores";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "template",
      message: "Select the project template:",
      choices: ["Basic Template", "BTL Template (NestJS)"],
      default: "Basic Template",
    },
    {
      type: "list",
      name: "framework",
      message: "Select the framework:",
      choices: ["Express.js", "Fastify", "Koa.js"],
      default: "Express.js",
      when: (answers) => answers.template === "Basic Template",
    },
    {
      type: "list",
      name: "orm",
      message: "Select the ORM:",
      choices: ["TypeORM", "Sequelize", "Prisma", "None"],
      default: "TypeORM",
      when: (answers) => answers.template === "Basic Template",
    },
    {
      type: "list",
      name: "db",
      message: "Select the database type:",
      choices: ["MySQL", "PostgreSQL", "MSSQL", "MongoDB", "SQLite"],
      default: "PostgreSQL",
      when: (answers) =>
        (answers.orm !== "None" && answers.template === "Basic Template") ||
        answers.template === "BTL Template (NestJS)",
    },
    {
      type: "list",
      name: "language",
      message: "Select the language:",
      choices: ["TypeScript", "JavaScript"],
      default: "TypeScript",
      when: (answers) => answers.template === "Basic Template",
    },
    {
      type: "confirm",
      name: "enableAuth",
      message: "Do you want authentication (JWT)?",
      default: true,
      when: (answers) => answers.template === "Basic Template",
    },
    {
      type: "confirm",
      name: "enableJwtAuth",
      message: "Do you want JWT authentication?",
      default: true,
      when: (answers) => answers.template === "BTL Template (NestJS)",
    },
    {
      type: "confirm",
      name: "enableXSignature",
      message: "Do you want X-Signature authentication?",
      default: true,
      when: (answers) => answers.template === "BTL Template (NestJS)",
    },
    {
      type: "confirm",
      name: "enableLogging",
      message: "Do you want logging (Winston)?",
      default: true,
      when: (answers) => answers.template === "Basic Template",
    },
    {
      type: "confirm",
      name: "enableValidation",
      message: "Do you want request validation?",
      default: true,
      when: (answers) => answers.template === "Basic Template",
    },
    {
      type: "list",
      name: "validationLibrary",
      message: "Select validation library:",
      choices: ["Joi", "Zod", "class-validator"],
      default: "Joi",
      when: (answers) =>
        answers.enableValidation && answers.template === "Basic Template",
    },
    {
      type: "confirm",
      name: "enableTesting",
      message: "Do you want testing setup (Jest)?",
      default: true,
      when: (answers) => answers.template === "Basic Template",
    },
    {
      type: "confirm",
      name: "enableDocker",
      message: "Do you want Docker configuration?",
      default: false,
    },
  ]);

  const targetDir = path.join(process.cwd(), answers.appName);

  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(`❌ Error: Directory '${answers.appName}' already exists!`);
    process.exit(1);
  }

  console.log(`\n📦 Scaffolding project: ${answers.appName}`);
  console.log("🔄 Copying template files...\n");

  // Choose template directory based on selection
  let templateDir;
  if (answers.template === "BTL Template (NestJS)") {
    templateDir = path.join(__dirname, "btl-template");
  } else {
    templateDir = path.join(__dirname, "template");
  }

  fs.copySync(templateDir, targetDir);

  // Handle different template types
  if (answers.template === "BTL Template (NestJS)") {
    await customizeBTLTemplate(targetDir, answers);
  } else {
    await customizeBasicTemplate(targetDir, answers);
  }

  // Install dependencies
  console.log("📥 Installing dependencies...");
  await installDependencies(targetDir, answers);

  console.log("\n✅ Project initialized successfully!");
  console.log(`\n📋 Next steps:`);
  console.log(`   cd ${answers.appName}`);

  if (answers.template === "BTL Template (NestJS)") {
    console.log(`   make dev-start`);
    console.log(`\n🔧 Configuration:`);
    if (answers.enableJwtAuth) {
      console.log(`   ✅ JWT Authentication enabled`);
    } else {
      console.log(`   ❌ JWT Authentication disabled`);
    }
    if (answers.enableXSignature) {
      console.log(`   ✅ X-Signature Authentication enabled`);
    } else {
      console.log(`   ❌ X-Signature Authentication disabled`);
    }
    console.log(`\n📝 Don't forget to:`);
    console.log(`   • Update api/.env file with your database credentials`);
    console.log(`   • Run migrations: make db-migrate-up`);
    console.log(`   • Run seeders: make db-seeder-run`);
    if (answers.enableXSignature) {
      console.log(
        `   • Set PRE_SHARED_API_KEY in api/.env for X-Signature auth`
      );
    }
    if (answers.enableJwtAuth) {
      console.log(`   • Set JWT_SECRET in api/.env for JWT auth`);
    }
    console.log(`\n🛠️  Available Makefile commands:`);
    console.log(`   • make install - Install dependencies for all services`);
    console.log(`   • make dev-start - Start development server`);
    console.log(`   • make db-migrate-up - Run database migrations`);
    console.log(`   • make db-seeder-run - Run database seeders`);
    console.log(`   • make email-test - Test email service`);
  } else {
    console.log(`   npm run dev`);
  }

  if (answers.enableDocker) {
    console.log(`   docker-compose up (for database)`);
  }

  console.log(`\n🎉 Happy coding!`);
}

async function customizeBasicTemplate(targetDir, answers) {
  // Modify package.json based on selections
  await customizePackageJson(targetDir, answers);

  // Create configuration files based on selections
  await createConfigFiles(targetDir, answers);

  // Create source files based on framework and language
  await createSourceFiles(targetDir, answers);

  // Create additional utility files
  if (answers.enableLogging) {
    await createLoggerFiles(
      targetDir + "/src",
      answers,
      answers.language === "TypeScript" ? "ts" : "js"
    );
  }

  if (answers.enableValidation) {
    await createValidationFiles(
      targetDir + "/src",
      answers,
      answers.language === "TypeScript" ? "ts" : "js"
    );
  }

  if (answers.enableTesting) {
    await createTestFiles(
      targetDir,
      answers,
      answers.language === "TypeScript" ? "ts" : "js"
    );
  }

  // Install dependencies
  console.log("📥 Installing dependencies...");
  await installDependencies(targetDir, answers);
}

async function customizeBTLTemplate(targetDir, answers) {
  // Customize package.json for BTL template
  await customizeBTLPackageJson(targetDir, answers);

  // Customize environment variables
  await customizeBTLEnvironment(targetDir, answers);

  // Customize auth guards based on selections
  await customizeBTLAuthGuards(targetDir, answers);

  // Install dependencies for BTL template
  console.log("📥 Installing dependencies...");
  await installBTLDependencies(targetDir, answers);
}

async function customizeBTLPackageJson(targetDir, answers) {
  const packageJsonPath = path.join(targetDir, "api/package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.name = answers.appName;
  packageJson.description = `${answers.appName} - A NestJS application based on BTL template`;

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function customizeBTLEnvironment(targetDir, answers) {
  const envExamplePath = path.join(targetDir, "api/.env.example");
  let envContent = fs.readFileSync(envExamplePath, "utf8");

  // Update app name in env
  envContent = envContent.replace(/APP_NAME=.*/, `APP_NAME=${answers.appName}`);

  // Add/remove auth-related variables based on selections
  if (!answers.enableJwtAuth) {
    // Comment out JWT-related variables if JWT is disabled
    envContent = envContent.replace(/^JWT_SECRET=/, "#JWT_SECRET=");
    envContent = envContent.replace(/^JWT_API_SECRET=/, "#JWT_API_SECRET=");
  }

  if (!answers.enableXSignature) {
    // Update app name in env
    envContent = envContent.replace(
      /PRE_SHARED_API_KEY=.*/,
      `# PRE_SHARED_API_KEY=UPDATE_ME`
    );
  }

  // Update database configuration
  switch (answers.db) {
    case "PostgreSQL":
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=5432");
      envContent = envContent.replace(/DB_USERNAME=.*/, "DB_USERNAME=postgres");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=password");
      envContent = envContent.replace(
        /DB_NAME=.*/,
        `DB_NAME=${answers.appName}`
      );
      break;
    case "MySQL":
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=3306");
      envContent = envContent.replace(/DB_USERNAME=.*/, "DB_USERNAME=root");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=password");
      envContent = envContent.replace(
        /DB_NAME=.*/,
        `DB_NAME=${answers.appName}`
      );
      break;
  }

  fs.writeFileSync(envExamplePath, envContent);
  fs.writeFileSync(path.join(targetDir, "api/.env"), envContent);
}

async function customizeBTLAuthGuards(targetDir, answers) {
  const appModulePath = path.join(targetDir, "api/src/app.module.ts");
  let appModuleContent = fs.readFileSync(appModulePath, "utf8");

  // Handle both authentication imports
  if (!answers.enableJwtAuth) {
    // Comment out JWT guard import
    appModuleContent = appModuleContent.replace(
      /import { UserAuthGuard } from '.\/app-guards\/jwt-auth.guard';/,
      "// JWT authentication disabled\n// import { UserAuthGuard } from './app-guards/jwt-auth.guard';"
    );
  }

  if (!answers.enableXSignature) {
    // Comment out X-Signature guard import
    appModuleContent = appModuleContent.replace(
      /import { DefaultAuthGuard } from '.\/app-guards\/auth.guard';/,
      "// X-Signature authentication disabled\n// import { DefaultAuthGuard } from './app-guards/auth.guard';"
    );
  }

  // Handle providers section - replace the entire providers array for clean formatting
  if (!answers.enableJwtAuth && !answers.enableXSignature) {
    // Both disabled - comment out both guards
    appModuleContent = appModuleContent.replace(
      /providers:\s*\[\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*DefaultAuthGuard,\s*},\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*UserAuthGuard,\s*},\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*ActionsGuard,\s*},\s*\]/s,
      `providers: [
    {
      provide: APP_GUARD,
      useClass: ActionsGuard,
    },
  ]`
    );
  } else if (!answers.enableXSignature) {
    // Only X-Signature disabled
    appModuleContent = appModuleContent.replace(
      /providers:\s*\[\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*DefaultAuthGuard,\s*},\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*UserAuthGuard,\s*},\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*ActionsGuard,\s*},\s*\]/s,
      `providers: [
    {
      provide: APP_GUARD,
      useClass: UserAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActionsGuard,
    },
  ]`
    );
  } else if (!answers.enableJwtAuth) {
    // Only JWT disabled
    appModuleContent = appModuleContent.replace(
      /providers:\s*\[\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*DefaultAuthGuard,\s*},\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*UserAuthGuard,\s*},\s*{\s*provide:\s*APP_GUARD,\s*useClass:\s*ActionsGuard,\s*},\s*\]/s,
      `providers: [
    {
      provide: APP_GUARD,
      useClass: DefaultAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ActionsGuard,
    },
  ]`
    );
  }

  // Update app.module.ts to conditionally use guards
  const guardConfig = `
// Authentication configuration
const authGuards = [];
${
  answers.enableJwtAuth
    ? "// JWT authentication enabled"
    : "// JWT authentication disabled"
}
${
  answers.enableXSignature
    ? "// X-Signature authentication enabled"
    : "// X-Signature authentication disabled"
}
`;

  appModuleContent = appModuleContent.replace(
    /@Module\({/,
    `${guardConfig}\n@Module({`
  );

  fs.writeFileSync(appModulePath, appModuleContent);

  // Customize auth guard files
  if (!answers.enableJwtAuth) {
    const jwtGuardPath = path.join(
      targetDir,
      "api/src/app-guards/jwt-auth.guard.ts"
    );
    let jwtGuardContent = fs.readFileSync(jwtGuardPath, "utf8");
    jwtGuardContent = `// JWT Authentication is disabled\n/* ${jwtGuardContent} */`;
    fs.writeFileSync(jwtGuardPath, jwtGuardContent);
  }

  if (!answers.enableXSignature) {
    const authGuardPath = path.join(
      targetDir,
      "api/src/app-guards/auth.guard.ts"
    );
    let authGuardContent = fs.readFileSync(authGuardPath, "utf8");
    authGuardContent = `// X-Signature Authentication is disabled\n/* ${authGuardContent} */`;
    fs.writeFileSync(authGuardPath, authGuardContent);
  }

  // Update environment configuration
  const envPath = path.join(targetDir, "api/src/constructs/env.ts");
  let envContent = fs.readFileSync(envPath, "utf8");

  if (!answers.enableXSignature) {
    // Comment out x-signature related env variables
    envContent = envContent.replace(
      /preSharedApiKey: env\.PRE_SHARED_API_KEY,?/g,
      "// preSharedApiKey: env.PRE_SHARED_API_KEY, // X-Signature disabled"
    );
  } else {
    // Add x-signature env if not present
    if (!envContent.includes("preSharedApiKey")) {
      envContent = envContent.replace(
        /export const envs = {[\s\S]*?appName: env\.APP_NAME,/,
        `export const envs = {
  authData: {
    appName: env.APP_NAME,
    preSharedApiKey: env.PRE_SHARED_API_KEY,
  },`
      );
    }
  }

  fs.writeFileSync(envPath, envContent);
}

async function installBTLDependencies(targetDir, answers) {
  // BTL template uses Makefile for dependency management
  try {
    console.log("Installing BTL template dependencies using Makefile...");
    execSync(`cd ${targetDir} && make install`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error installing dependencies:", error.message);
    console.log("You can install them manually by running:");
    console.log(`cd ${path.basename(targetDir)}`);
    console.log(`make install`);
  }
}

async function customizePackageJson(targetDir, answers) {
  const packageJsonPath = path.join(targetDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.name = answers.appName;
  packageJson.description = `${answers.appName} - A Node.js application`;

  // Set scripts based on language
  if (answers.language === "TypeScript") {
    packageJson.scripts = {
      build: "tsc",
      start: "node dist/index.js",
      dev: "ts-node-dev --respawn --transpile-only src/index.ts",
      lint: "eslint src/**/*.ts",
      test: answers.enableTesting ? "jest" : 'echo "No tests specified"',
    };
  } else {
    packageJson.scripts = {
      start: "node src/index.js",
      dev: "nodemon src/index.js",
      lint: "eslint src/**/*.js",
      test: answers.enableTesting ? "jest" : 'echo "No tests specified"',
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function createConfigFiles(targetDir, answers) {
  // Create TypeScript config if needed
  if (answers.language === "TypeScript") {
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020"],
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        experimentalDecorators: answers.orm === "TypeORM",
        emitDecoratorMetadata: answers.orm === "TypeORM",
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"],
    };

    fs.writeFileSync(
      path.join(targetDir, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  // Create environment file
  let envContent = `# Environment Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
`;

  if (answers.db && answers.orm !== "None") {
    switch (answers.db) {
      case "PostgreSQL":
        envContent += `DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=${answers.appName}
DATABASE_URL=postgresql://postgres:password@localhost:5432/${answers.appName}
`;
        break;
      case "MySQL":
        envContent += `DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=${answers.appName}
DATABASE_URL=mysql://root:password@localhost:3306/${answers.appName}
`;
        break;
      case "MongoDB":
        envContent += `DB_HOST=localhost
DB_PORT=27017
DB_NAME=${answers.appName}
DATABASE_URL=mongodb://localhost:27017/${answers.appName}
`;
        break;
      case "SQLite":
        envContent += `DATABASE_URL=file:./database.sqlite
`;
        break;
    }
  }

  if (answers.enableAuth) {
    envContent += `
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
`;
  }

  fs.writeFileSync(path.join(targetDir, ".env.example"), envContent);
  fs.writeFileSync(path.join(targetDir, ".env"), envContent);

  // Create Docker configuration if enabled
  if (answers.enableDocker) {
    await createDockerFiles(targetDir, answers);
  }
}

async function createDockerFiles(targetDir, answers) {
  // Dockerfile
  const dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

${answers.language === "TypeScript" ? "RUN npm run build" : ""}

EXPOSE 3000

CMD ["npm", "start"]
`;

  fs.writeFileSync(path.join(targetDir, "Dockerfile"), dockerfile);

  // Docker Compose
  let dockerCompose = `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
`;

  if (answers.db) {
    switch (answers.db) {
      case "PostgreSQL":
        dockerCompose += `      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${answers.appName}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
        break;
      case "MySQL":
        dockerCompose += `      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: ${answers.appName}
      MYSQL_ROOT_PASSWORD: password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
`;
        break;
      case "MongoDB":
        dockerCompose += `      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
`;
        break;
    }
  }

  fs.writeFileSync(path.join(targetDir, "docker-compose.yml"), dockerCompose);
}

async function createSourceFiles(targetDir, answers) {
  const srcDir = path.join(targetDir, "src");
  const ext = answers.language === "TypeScript" ? "ts" : "js";

  // Create main index file
  let indexContent = "";

  if (answers.framework === "Express.js") {
    indexContent = createExpressApp(answers, ext);
  } else if (answers.framework === "Fastify") {
    indexContent = createFastifyApp(answers, ext);
  } else if (answers.framework === "Koa.js") {
    indexContent = createKoaApp(answers, ext);
  }

  fs.writeFileSync(path.join(srcDir, `index.${ext}`), indexContent);

  // Create additional files based on features
  if (answers.enableAuth) {
    await createAuthFiles(srcDir, answers, ext);
  }

  if (answers.orm !== "None") {
    await createDatabaseFiles(srcDir, answers, ext);
  }
}

function createExpressApp(answers, ext) {
  const isTs = ext === "ts";
  const importSyntax = isTs ? "import" : "require";

  return `${
    isTs
      ? "import express from 'express';"
      : "const express = require('express');"
  }
${isTs ? "import cors from 'cors';" : "const cors = require('cors');"}
${isTs ? "import helmet from 'helmet';" : "const helmet = require('helmet');"}
${
  answers.enableLogging
    ? isTs
      ? "import { logger } from './utils/logger';"
      : "const { logger } = require('./utils/logger');"
    : ""
}
${
  answers.enableAuth
    ? isTs
      ? "import authRoutes from './routes/auth';"
      : "const authRoutes = require('./routes/auth');"
    : ""
}

${
  isTs
    ? "const app: express.Application = express();"
    : "const app = express();"
}
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ${answers.appName}!',
    timestamp: new Date().toISOString()
  });
});

${answers.enableAuth ? "app.use('/api/auth', authRoutes);" : ""}

// Error handling middleware
app.use((err${isTs ? ": any" : ""}, req${isTs ? ": express.Request" : ""}, res${
    isTs ? ": express.Response" : ""
  }, next${isTs ? ": express.NextFunction" : ""}) => {
  ${
    answers.enableLogging
      ? "logger.error(err.stack);"
      : "console.error(err.stack);"
  }
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  ${
    answers.enableLogging ? "logger.info" : "console.log"
  }(\`🚀 Server running on port \${PORT}\`);
});

${isTs ? "export default app;" : "module.exports = app;"}
`;
}

function createFastifyApp(answers, ext) {
  const isTs = ext === "ts";

  return `${
    isTs
      ? "import Fastify from 'fastify';"
      : "const fastify = require('fastify');"
  }
${
  answers.enableLogging
    ? isTs
      ? "import { logger } from './utils/logger';"
      : "const { logger } = require('./utils/logger');"
    : ""
}

${
  isTs
    ? "const fastify = Fastify({ logger: true });"
    : "const app = fastify({ logger: true });"
}

// Register plugins
${isTs ? "fastify" : "app"}.register(require('@fastify/helmet'));
${isTs ? "fastify" : "app"}.register(require('@fastify/cors'));

// Routes
${isTs ? "fastify" : "app"}.get('/', async (request, reply) => {
  return { 
    message: 'Welcome to ${answers.appName}!',
    timestamp: new Date().toISOString()
  };
});

// Start server
const start = async () => {
  try {
    await ${isTs ? "fastify" : "app"}.listen({ port: 3000 });
    ${
      answers.enableLogging ? "logger.info" : "console.log"
    }('🚀 Server running on port 3000');
  } catch (err) {
    ${isTs ? "fastify" : "app"}.log.error(err);
    process.exit(1);
  }
};

start();
`;
}

function createKoaApp(answers, ext) {
  const isTs = ext === "ts";

  return `${isTs ? "import Koa from 'koa';" : "const Koa = require('koa');"}
${
  isTs
    ? "import Router from '@koa/router';"
    : "const Router = require('@koa/router');"
}
${
  isTs
    ? "import bodyParser from 'koa-bodyparser';"
    : "const bodyParser = require('koa-bodyparser');"
}
${
  isTs
    ? "import helmet from 'koa-helmet';"
    : "const helmet = require('koa-helmet');"
}
${
  answers.enableLogging
    ? isTs
      ? "import { logger } from './utils/logger';"
      : "const { logger } = require('./utils/logger');"
    : ""
}

const app = new Koa();
const router = new Router();

// Middleware
app.use(helmet());
app.use(bodyParser());

// Routes
router.get('/', (ctx) => {
  ctx.body = { 
    message: 'Welcome to ${answers.appName}!',
    timestamp: new Date().toISOString()
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.on('error', (err, ctx) => {
  ${
    answers.enableLogging ? "logger.error" : "console.error"
  }('Server error:', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  ${
    answers.enableLogging ? "logger.info" : "console.log"
  }(\`🚀 Server running on port \${PORT}\`);
});

${isTs ? "export default app;" : "module.exports = app;"}
`;
}

async function createAuthFiles(srcDir, answers, ext) {
  const routesDir = path.join(srcDir, "routes");
  const middlewareDir = path.join(srcDir, "middleware");
  const utilsDir = path.join(srcDir, "utils");

  fs.ensureDirSync(routesDir);
  fs.ensureDirSync(middlewareDir);
  fs.ensureDirSync(utilsDir);

  const isTs = ext === "ts";

  // Auth routes
  const authRoutes = `${
    isTs
      ? "import express from 'express';"
      : "const express = require('express');"
  }
${
  isTs
    ? "import jwt from 'jsonwebtoken';"
    : "const jwt = require('jsonwebtoken');"
}
${
  isTs
    ? "import bcrypt from 'bcryptjs';"
    : "const bcrypt = require('bcryptjs');"
}
${answers.enableValidation ? getValidationImports(answers, isTs) : ""}

${
  isTs ? "const router = express.Router();" : "const router = express.Router();"
}

// Mock user storage (replace with database)
const users${isTs ? ": any[]" : ""} = [];

// Register
router.post('/register'${
    answers.enableValidation ? getValidationMiddleware(answers, "register") : ""
  }, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = { 
      id: users.length + 1, 
      email, 
      password: hashedPassword 
    };
    users.push(user);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login'${
    answers.enableValidation ? getValidationMiddleware(answers, "login") : ""
  }, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

${isTs ? "export default router;" : "module.exports = router;"}
`;

  fs.writeFileSync(path.join(routesDir, `auth.${ext}`), authRoutes);

  // Auth middleware
  const authMiddleware = `${
    isTs
      ? "import jwt from 'jsonwebtoken';"
      : "const jwt = require('jsonwebtoken');"
  }
${isTs ? "import { Request, Response, NextFunction } from 'express';" : ""}

${
  isTs
    ? `
interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
`
    : "const authenticateToken = (req, res, next) => {"
}
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err${
    isTs ? ": any" : ""
  }, user${isTs ? ": any" : ""}) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

${isTs ? "" : "module.exports = { authenticateToken };"}
`;

  fs.writeFileSync(path.join(middlewareDir, `auth.${ext}`), authMiddleware);
}

function getValidationImports(answers, isTs) {
  switch (answers.validationLibrary) {
    case "Joi":
      return isTs
        ? "import { validate, userSchemas } from '../utils/validation';"
        : "const { validate, userSchemas } = require('../utils/validation');";
    case "Zod":
      return isTs
        ? "import { validate, userSchemas } from '../utils/validation';"
        : "const { validate, userSchemas } = require('../utils/validation');";
    case "class-validator":
      return isTs
        ? "import { validateDto } from '../utils/validation';\nimport { RegisterDto, LoginDto } from '../dto/user';"
        : "const { validateDto } = require('../utils/validation');\nconst { RegisterDto, LoginDto } = require('../dto/user');";
    default:
      return "";
  }
}

function getValidationMiddleware(answers, action) {
  switch (answers.validationLibrary) {
    case "Joi":
    case "Zod":
      return `, validate(userSchemas.${action})`;
    case "class-validator": {
      const dtoClass = action === "register" ? "RegisterDto" : "LoginDto";
      return `, validateDto(${dtoClass})`;
    }
    default:
      return "";
  }
}

async function createDatabaseFiles(srcDir, answers, ext) {
  const configDir = path.join(srcDir, "config");
  fs.ensureDirSync(configDir);

  if (answers.orm === "TypeORM") {
    await createTypeORMConfig(configDir, answers, ext);
  } else if (answers.orm === "Sequelize") {
    await createSequelizeConfig(configDir, answers, ext);
  } else if (answers.orm === "Prisma") {
    await createPrismaConfig(srcDir, answers);
  }
}

async function createTypeORMConfig(configDir, answers, ext) {
  const isTs = ext === "ts";

  const config = `${
    isTs
      ? "import { DataSource } from 'typeorm';"
      : "const { DataSource } = require('typeorm');"
  }

${
  isTs
    ? "export const AppDataSource = new DataSource({"
    : "const AppDataSource = new DataSource({"
}
  type: '${answers.db.toLowerCase()}',
  host: process.env.DB_HOST || 'localhost',
  port: ${
    answers.db === "PostgreSQL"
      ? "5432"
      : answers.db === "MySQL"
      ? "3306"
      : "27017"
  },
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [__dirname + '/../entities/*${isTs ? ".ts" : ".js"}'],
  migrations: [__dirname + '/../migrations/*${isTs ? ".ts" : ".js"}'],
  subscribers: [__dirname + '/../subscribers/*${isTs ? ".ts" : ".js"}'],
});

${isTs ? "" : "module.exports = { AppDataSource };"}
`;

  fs.writeFileSync(path.join(configDir, `database.${ext}`), config);
}

async function createSequelizeConfig(configDir, answers, ext) {
  const isTs = ext === "ts";

  const config = `${
    isTs
      ? "import { Sequelize } from 'sequelize';"
      : "const { Sequelize } = require('sequelize');"
  }

${
  isTs
    ? "export const sequelize = new Sequelize("
    : "const sequelize = new Sequelize("
}
  process.env.DATABASE_URL || {
    dialect: '${answers.db.toLowerCase()}',
    host: process.env.DB_HOST || 'localhost',
    port: ${
      answers.db === "PostgreSQL"
        ? "5432"
        : answers.db === "MySQL"
        ? "3306"
        : "1433"
    },
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
  }
);

${isTs ? "" : "module.exports = { sequelize };"}
`;

  fs.writeFileSync(path.join(configDir, `database.${ext}`), config);
}

async function createPrismaConfig(srcDir, answers) {
  const prismaDir = path.join(path.dirname(srcDir), "prisma");
  fs.ensureDirSync(prismaDir);

  let databaseUrl = "";
  switch (answers.db) {
    case "PostgreSQL":
      databaseUrl = "postgresql://postgres:password@localhost:5432/mydb";
      break;
    case "MySQL":
      databaseUrl = "mysql://root:password@localhost:3306/mydb";
      break;
    case "SQLite":
      databaseUrl = "file:./dev.db";
      break;
  }

  const schema = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${answers.db.toLowerCase()}"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;

  fs.writeFileSync(path.join(prismaDir, "schema.prisma"), schema);
}

async function installDependencies(targetDir, answers) {
  const dependencies = ["dotenv"];
  const devDependencies = [];

  // Framework dependencies
  switch (answers.framework) {
    case "Express.js":
      dependencies.push("express", "helmet", "cors");
      if (answers.language === "TypeScript") {
        devDependencies.push("@types/express", "@types/helmet", "@types/cors");
      }
      break;
    case "Fastify":
      dependencies.push("fastify", "@fastify/helmet", "@fastify/cors");
      break;
    case "Koa.js":
      dependencies.push("koa", "@koa/router", "koa-bodyparser", "koa-helmet");
      if (answers.language === "TypeScript") {
        devDependencies.push(
          "@types/koa",
          "@types/koa__router",
          "@types/koa-bodyparser"
        );
      }
      break;
  }

  // Language dependencies
  if (answers.language === "TypeScript") {
    devDependencies.push("typescript", "ts-node-dev", "@types/node");
  } else {
    devDependencies.push("nodemon");
  }

  // ORM dependencies
  if (answers.orm === "TypeORM") {
    dependencies.push("typeorm", "reflect-metadata");
    if (answers.db === "MySQL") dependencies.push("mysql2");
    if (answers.db === "PostgreSQL") dependencies.push("pg");
    if (answers.db === "MSSQL") dependencies.push("mssql");
    if (answers.db === "MongoDB") dependencies.push("mongodb");
    if (answers.db === "SQLite") dependencies.push("sqlite3");

    if (answers.language === "TypeScript") {
      if (answers.db === "PostgreSQL") devDependencies.push("@types/pg");
    }
  } else if (answers.orm === "Sequelize") {
    dependencies.push("sequelize");
    if (answers.db === "MySQL") dependencies.push("mysql2");
    if (answers.db === "PostgreSQL") dependencies.push("pg", "pg-hstore");
    if (answers.db === "MSSQL") dependencies.push("tedious");
    if (answers.db === "SQLite") dependencies.push("sqlite3");

    if (answers.language === "TypeScript") {
      devDependencies.push("@types/sequelize");
      if (answers.db === "PostgreSQL") devDependencies.push("@types/pg");
    }
  } else if (answers.orm === "Prisma") {
    dependencies.push("@prisma/client");
    devDependencies.push("prisma");
  }

  // Feature dependencies
  if (answers.enableAuth) {
    dependencies.push("jsonwebtoken", "bcryptjs");
    if (answers.language === "TypeScript") {
      devDependencies.push("@types/jsonwebtoken", "@types/bcryptjs");
    }
  }

  if (answers.enableLogging) {
    dependencies.push("winston");
    if (answers.language === "TypeScript") {
      devDependencies.push("@types/winston");
    }
  }

  if (answers.enableValidation) {
    switch (answers.validationLibrary) {
      case "Joi":
        dependencies.push("joi");
        if (answers.language === "TypeScript") {
          devDependencies.push("@types/joi");
        }
        break;
      case "Zod":
        dependencies.push("zod");
        break;
      case "class-validator":
        dependencies.push("class-validator", "class-transformer");
        if (answers.language === "TypeScript") {
          devDependencies.push(
            "@types/class-validator",
            "@types/class-transformer"
          );
        }
        break;
    }
  }

  if (answers.enableTesting) {
    devDependencies.push("jest", "supertest");
    if (answers.language === "TypeScript") {
      devDependencies.push("@types/jest", "@types/supertest", "ts-jest");
    }
  }

  // Install dependencies
  try {
    console.log("Installing production dependencies...");
    execSync(`cd ${targetDir} && npm install ${dependencies.join(" ")}`, {
      stdio: "inherit",
    });

    if (devDependencies.length > 0) {
      console.log("Installing development dependencies...");
      execSync(
        `cd ${targetDir} && npm install --save-dev ${devDependencies.join(
          " "
        )}`,
        { stdio: "inherit" }
      );
    }
  } catch (error) {
    console.error("Error installing dependencies:", error.message);
    console.log("You can install them manually by running:");
    console.log(`cd ${path.basename(targetDir)}`);
    console.log(`npm install ${dependencies.join(" ")}`);
    if (devDependencies.length > 0) {
      console.log(`npm install --save-dev ${devDependencies.join(" ")}`);
    }
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

// Export for testing
module.exports = { customizeBTLAuthGuards };
