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
      choices: [
        "Basic Template",
        "NestJS Template", 
        "Enterprise API (NestJS)"
      ],
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
      when: (answers) => 
        answers.template === "Basic Template" ||
        answers.template === "NestJS Template" ||
        answers.template === "Enterprise API (NestJS)",
    },
    {
      type: "list",
      name: "db",
      message: "Select the database type:",
      choices: ["MySQL", "PostgreSQL", "MSSQL", "MongoDB", "SQLite"],
      default: "PostgreSQL",
      when: (answers) =>
        (answers.orm !== "None" && answers.template === "Basic Template") ||
        answers.template === "NestJS Template" ||
        answers.template === "Enterprise API (NestJS)",
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
      when: (answers) => 
        answers.template === "NestJS Template" ||
        answers.template === "Enterprise API (NestJS)",
    },
    {
      type: "confirm",
      name: "enableXSignature",
      message: "Do you want X-Signature authentication?",
      default: true,
      when: (answers) => 
        answers.template === "NestJS Template" ||
        answers.template === "Enterprise API (NestJS)",
    },
    {
      type: "confirm",
      name: "enablePM2tools",
      message: "Do you want PM2 process management tools?",
      default: false,
      when: (answers) => 
        answers.template === "NestJS Template" ||
        answers.template === "Enterprise API (NestJS)",
    },
    {
      type: "confirm",
      name: "enableUnitTesting",
      message: "Do you want comprehensive unit testing setup?",
      default: true,
      when: (answers) => 
        answers.template === "NestJS Template" ||
        answers.template === "Enterprise API (NestJS)",
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
      when: (answers) => !answers.enablePM2tools, // Only show Docker if PM2 is not selected
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
  if (answers.template === "Enterprise API (NestJS)") {
    templateDir = path.join(__dirname, "..", "template", "enterprise-template");
  } else if (answers.template === "NestJS Template") {
    templateDir = path.join(__dirname, "..", "template", "nestjs");
  } else {
    templateDir = path.join(__dirname, "..", "template", "basic");
  }

  fs.copySync(templateDir, targetDir);

  // Copy selected ORM models for NestJS and Enterprise API templates
  if (answers.template === "NestJS Template" || answers.template === "Enterprise API (NestJS)") {
    await copySelectedORMModels(targetDir, answers);
  }

  // Handle different template types
  if (answers.template === "Enterprise API (NestJS)") {
    await customizeEnterpriseAPITemplate(targetDir, answers);
  } else if (answers.template === "NestJS Template") {
    await customizeNestJSTemplate(targetDir, answers);
  } else {
    await customizeBasicTemplate(targetDir, answers);
  }

  // Install dependencies
  console.log("📥 Installing dependencies...");
  await installDependencies(targetDir, answers);

  console.log("\n✅ Project initialized successfully!");
  console.log(`\n📋 Next steps:`);
  console.log(`   cd ${answers.appName}`);

  if (answers.template === "Enterprise API (NestJS)") {
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
    
    if (answers.enablePM2tools) {
      console.log(`   ✅ PM2 Process Management enabled`);
    }
    
    if (answers.enableUnitTesting) {
      console.log(`   ✅ Comprehensive Unit Testing enabled`);
    }
    
    console.log(`\n📝 Don't forget to:`);
    console.log(`   • Update api/.env file with your database credentials`);
    console.log(`   • Run migrations: make db-migrate-up`);
    console.log(`   • Run seeders: make db-seeder-run`);
    
    if (answers.enableXSignature) {
      console.log(`   • Set PRE_SHARED_API_KEY in api/.env for X-Signature auth`);
    }
    
    if (answers.enableJwtAuth) {
      console.log(`   • Set JWT_SECRET in api/.env for JWT auth`);
    }
    
    if (answers.enablePM2tools) {
      console.log(`   • Configure PM2 settings in ecosystem.config.cjs`);
    }
    
    console.log(`\n🛠️  Available Makefile commands:`);
    console.log(`   • make install - Install dependencies for all services`);
    console.log(`   • make dev-start - Start development server`);
    console.log(`   • make db-migrate-up - Run database migrations`);
    console.log(`   • make db-seeder-run - Run database seeders`);
    console.log(`   • make email-test - Test email service`);
    
    if (answers.enableUnitTesting) {
      console.log(`   • make test - Run comprehensive unit tests`);
    }
    
    if (answers.enablePM2tools) {
      console.log(`   • make pm2-start - Start with PM2`);
      console.log(`   • make pm2-stop - Stop PM2 processes`);
    }
    
  } else if (answers.template === "NestJS Template") {
    console.log(`   npm run start:dev`);
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
    
    if (answers.enablePM2tools) {
      console.log(`   ✅ PM2 Process Management enabled`);
    }
    
    if (answers.enableUnitTesting) {
      console.log(`   ✅ Comprehensive Unit Testing enabled`);
    }
    
    console.log(`\n📝 Don't forget to:`);
    console.log(`   • Update .env file with your database credentials`);
    
    if (answers.enableXSignature) {
      console.log(`   • Set PRE_SHARED_API_KEY in .env for X-Signature auth`);
    }
    
    if (answers.enableJwtAuth) {
      console.log(`   • Set JWT_SECRET in .env for JWT auth`);
    }
    
    if (answers.enablePM2tools) {
      console.log(`   • Configure PM2 settings in ecosystem.config.cjs`);
    }
    
    console.log(`\n🛠️  Available commands:`);
    console.log(`   • npm run start:dev - Start development server`);
    console.log(`   • npm run build - Build for production`);
    console.log(`   • npm run migration:run - Run database migrations`);
    
    if (answers.enableUnitTesting) {
      console.log(`   • npm run test - Run unit tests`);
      console.log(`   • npm run test:e2e - Run end-to-end tests`);
      console.log(`   • npm run test:cov - Run tests with coverage`);
    }
    
    if (answers.enablePM2tools) {
      console.log(`   • npm run pm2:start - Start with PM2`);
      console.log(`   • npm run pm2:stop - Stop PM2 processes`);
    }
    
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

async function copySelectedORMModels(targetDir, answers) {
  console.log(`🔄 Setting up ${answers.orm} models...`);
  
  const isNestJS = answers.template === "NestJS Template";
  const isBTL = answers.template === "Enterprise API (NestJS)";
  
  // Determine model directories
  let sourceModelsDir, targetModelsDir;
  
  if (isBTL) {
    sourceModelsDir = path.join(targetDir, "api/src/model");
    targetModelsDir = path.join(targetDir, "api/src/model");
  } else if (isNestJS) {
    sourceModelsDir = path.join(targetDir, "src/model");
    targetModelsDir = path.join(targetDir, "src/model");
  }
  
  // Map ORM choice to folder name
  const ormFolderMap = {
    "TypeORM": "typeorm",
    "Sequelize": "sequelize", 
    "Prisma": "prisma",
    "None": "interfaces"
  };
  
  const selectedORMFolder = ormFolderMap[answers.orm];
  const sourceOrmDir = path.join(sourceModelsDir, selectedORMFolder);
  
  // Check if the ORM-specific folder exists
  if (!fs.existsSync(sourceOrmDir)) {
    console.log(`⚠️  Warning: ${answers.orm} models not found at ${sourceOrmDir}`);
    return;
  }
  
  // Copy selected ORM models to the model directory
  if (answers.orm === "Prisma") {
    // For Prisma, copy the schema file to the project root
    const prismaSchemaSource = path.join(sourceOrmDir, "schema.prisma");
    const templatePrismaSchema = isBTL 
      ? path.join(__dirname, "../template/enterprise-template/prisma.schema")
      : path.join(__dirname, "../template/nestjs/prisma.schema");
    const prismaDir = path.join(targetDir, "prisma");
    const prismaSchemaTarget = path.join(prismaDir, "schema.prisma");
    
    // Copy from ORM-specific folder if it exists, otherwise use template default
    let schemaSource = prismaSchemaSource;
    if (!fs.existsSync(prismaSchemaSource) && fs.existsSync(templatePrismaSchema)) {
      schemaSource = templatePrismaSchema;
    }
    
    if (fs.existsSync(schemaSource)) {
      fs.ensureDirSync(prismaDir);
      fs.copyFileSync(schemaSource, prismaSchemaTarget);
      console.log(`✅ Copied Prisma schema to ./prisma/schema.prisma`);
    }
  } else {
    // For other ORMs, copy model files directly to the model directory
    const files = fs.readdirSync(sourceOrmDir);
    
    for (const file of files) {
      if (file === "index.ts" || file.endsWith(".model.ts")) {
        const sourceFile = path.join(sourceOrmDir, file);
        const targetFile = path.join(targetModelsDir, file);
        
        // Read file content and fix import paths
        let content = fs.readFileSync(sourceFile, 'utf8');
        
        // Fix import paths when copying from subfolder to root model directory
        if (answers.orm === "TypeORM") {
          // Change '../../constructs' to '../constructs' since we're moving from typeorm/ to model/
          content = content.replace(/import { enums } from '\.\.\/\.\.\/constructs';/g, "import { enums } from '../constructs';");
        }
        
        fs.writeFileSync(targetFile, content);
      }
    }
    console.log(`✅ Copied ${answers.orm} models to ./src/model/`);
  }
  
  // Clean up ORM-specific folders after copying
  const ormFolders = ["typeorm", "sequelize", "prisma", "interfaces"];
  for (const folder of ormFolders) {
    const folderPath = path.join(sourceModelsDir, folder);
    if (fs.existsSync(folderPath)) {
      fs.removeSync(folderPath);
    }
  }
  
  console.log(`🧹 Cleaned up unused ORM folders`);
  
  // Generate initial migration if ORM supports it
  if (answers.orm !== "None") {
    await generateInitialMigration(targetDir, answers);
  }

  // Create Sequelize configuration files if Sequelize is selected
  if (answers.orm === "Sequelize") {
    await createSequelizeConfigFiles(targetDir, answers);
  }
}

async function createSequelizeConfigFiles(targetDir, answers) {
  console.log('🔄 Creating Sequelize configuration files...');
  
  const isBTL = answers.template === "Enterprise API (NestJS)";
  const configDir = isBTL ? path.join(targetDir, 'api', 'src', 'config') : path.join(targetDir, 'src', 'config');

  // Create .sequelizerc file in project root
  const sequelizeRcContent = `const path = require('path');

module.exports = {
  'config': path.resolve('${isBTL ? 'api/src/config' : 'src/config'}', 'sequelize.config.js'),
  'models-path': path.resolve('${isBTL ? 'api/src/model' : 'src/model'}'),
  'seeders-path': path.resolve('${isBTL ? 'api/src/seeders' : 'src/seeders'}'),
  'migrations-path': path.resolve('${isBTL ? 'api/src/migrations' : 'src/migrations'}')
};
`;

  await fs.writeFile(path.join(targetDir, '.sequelizerc'), sequelizeRcContent);
  console.log('✅ Created .sequelizerc configuration file');

  // For Enterprise API template, also create .sequelizerc in api directory with relative paths
  if (isBTL) {
    const apiSequelizeRcContent = `const path = require('path');

module.exports = {
  'config': path.resolve('src/config', 'sequelize.config.js'),
  'models-path': path.resolve('src/model'),
  'seeders-path': path.resolve('src/seeders'),
  'migrations-path': path.resolve('src/migrations')
};
`;
    await fs.writeFile(path.join(targetDir, 'api', '.sequelizerc'), apiSequelizeRcContent);
    console.log('✅ Created api/.sequelizerc configuration file for BTL template');
  }

  // Create sequelize.config.js file
  const sequelizeConfigContent = `require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'database_development',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'database_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};
`;

  await fs.ensureDir(configDir);
  await fs.writeFile(path.join(configDir, 'sequelize.config.js'), sequelizeConfigContent);
  console.log('✅ Created Sequelize configuration file');
}

async function generateInitialMigration(targetDir, answers) {
  console.log(`🔄 Generating initial migration for ${answers.orm}...`);
  
  const isNestJS = answers.template === "NestJS Template";
  const isBTL = answers.template === "Enterprise API (NestJS)";
  
  // Determine migration directory
  let migrationDir;
  if (isBTL) {
    migrationDir = path.join(targetDir, "api/src/migrations");
  } else if (isNestJS) {
    migrationDir = path.join(targetDir, "src/migrations");
  } else {
    migrationDir = path.join(targetDir, "migrations");
  }
  
  fs.ensureDirSync(migrationDir);
  
  const timestamp = Date.now();
  
  switch (answers.orm) {
    case "TypeORM":
      await generateTypeORMMigration(migrationDir, timestamp, answers);
      break;
    case "Sequelize":
      await generateSequelizeMigration(migrationDir, timestamp, answers);
      break;
    case "Prisma":
      await generatePrismaMigration(targetDir, answers);
      break;
  }
  
  console.log(`✅ Initial migration generated for ${answers.orm}`);
}

async function generateTypeORMMigration(migrationDir, timestamp, answers) {
  const migrationName = `${timestamp}-InitialMigration`;
  const isBTL = answers.template === "Enterprise API (NestJS)";
  
  let tableCreation, indexCreation, tableDrop;
  
  if (isBTL) {
    // Enterprise API template with comprehensive models matching actual model definitions
    tableCreation = `
        // Countries table
        await queryRunner.query(\`
            CREATE TABLE "countries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "code" character varying(3) NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_country_code" UNIQUE ("code"),
                CONSTRAINT "PK_countries" PRIMARY KEY ("id")
            )
        \`);

        // States table
        await queryRunner.query(\`
            CREATE TABLE "states" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "code" character varying(10) NOT NULL,
                "countryId" uuid NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_states" PRIMARY KEY ("id"),
                CONSTRAINT "FK_states_country" FOREIGN KEY ("countryId") REFERENCES "countries"("id")
            )
        \`);

        // LGAs table
        await queryRunner.query(\`
            CREATE TABLE "lgas" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "code" character varying(10) NOT NULL,
                "stateId" uuid NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_lgas" PRIMARY KEY ("id"),
                CONSTRAINT "FK_lgas_state" FOREIGN KEY ("stateId") REFERENCES "states"("id")
            )
        \`);

        // Wards table
        await queryRunner.query(\`
            CREATE TABLE "wards" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "code" character varying(10) NOT NULL,
                "lgaId" uuid NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_wards" PRIMARY KEY ("id"),
                CONSTRAINT "FK_wards_lga" FOREIGN KEY ("lgaId") REFERENCES "lgas"("id")
            )
        \`);

        // Zones table
        await queryRunner.query(\`
            CREATE TABLE "zones" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "description" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_zones" PRIMARY KEY ("id")
            )
        \`);

        // Groups table
        await queryRunner.query(\`
            CREATE TABLE "groups" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "description" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_groups" PRIMARY KEY ("id")
            )
        \`);

        // Roles table
        await queryRunner.query(\`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(50) NOT NULL,
                "description" text,
                "permissions" jsonb,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_roles" PRIMARY KEY ("id")
            )
        \`);

        // Application Files table
        await queryRunner.query(\`
            CREATE TABLE "application_files" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "key" text NOT NULL,
                "eTag" text NOT NULL,
                "mimeType" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_application_files" PRIMARY KEY ("id")
            )
        \`);

        // Users table (comprehensive with all fields matching actual model)
        await queryRunner.query(\`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "firstName" character varying(50),
                "lastName" character varying(50),
                "middleName" character varying(50),
                "gender" integer,
                "phoneNumber" character varying(15),
                "emailAddress" character varying(50) NOT NULL,
                "nin" character varying(11),
                "profileImageId" uuid,
                "zoneId" uuid,
                "stateId" uuid,
                "lgaId" uuid,
                "wardId" uuid,
                "groupId" uuid NOT NULL,
                "password" character varying,
                "verified" boolean DEFAULT false,
                "requirePasswordChange" boolean DEFAULT false,
                "twoFactorSecret" character varying,
                "isTwoFactorEnabled" boolean DEFAULT false,
                "roleId" uuid,
                "status" integer NOT NULL DEFAULT 1,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_user_email" UNIQUE ("emailAddress"),
                CONSTRAINT "UQ_user_phone" UNIQUE ("phoneNumber"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_profile_image" FOREIGN KEY ("profileImageId") REFERENCES "application_files"("id"),
                CONSTRAINT "FK_users_zone" FOREIGN KEY ("zoneId") REFERENCES "zones"("id"),
                CONSTRAINT "FK_users_state" FOREIGN KEY ("stateId") REFERENCES "states"("id"),
                CONSTRAINT "FK_users_lga" FOREIGN KEY ("lgaId") REFERENCES "lgas"("id"),
                CONSTRAINT "FK_users_ward" FOREIGN KEY ("wardId") REFERENCES "wards"("id"),
                CONSTRAINT "FK_users_group" FOREIGN KEY ("groupId") REFERENCES "groups"("id"),
                CONSTRAINT "FK_users_role" FOREIGN KEY ("roleId") REFERENCES "roles"("id")
            )
        \`);

        // Notifications table
        await queryRunner.query(\`
            CREATE TABLE "notifications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "status" integer NOT NULL,
                "to" character varying(50) NOT NULL,
                "from" character varying(100) NOT NULL,
                "subject" character varying(100) NOT NULL,
                "text" text NOT NULL,
                "seen" boolean NOT NULL,
                "type" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
            )
        \`);

        // Logs table
        await queryRunner.query(\`
            CREATE TABLE "logs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "action" character varying NOT NULL,
                "entity" character varying NOT NULL,
                "entityId" uuid,
                "userId" uuid,
                "details" jsonb,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_logs" PRIMARY KEY ("id"),
                CONSTRAINT "FK_logs_user" FOREIGN KEY ("userId") REFERENCES "users"("id")
            )
        \`);

        // OTP table (correct structure with otpIssuedAt and isUsed)
        await queryRunner.query(\`
            CREATE TABLE "otps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying(50),
                "otp" character varying(10) NOT NULL,
                "otpIssuedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "isUsed" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_otps" PRIMARY KEY ("id")
            )
        \`);

        // Token table (correct structure based on actual model)
        await queryRunner.query(\`
            CREATE TABLE "tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tokenName" character varying(200) NOT NULL,
                "jwt" text,
                "expires" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_tokens_token_name" UNIQUE ("tokenName"),
                CONSTRAINT "PK_tokens" PRIMARY KEY ("id")
            )
        \`);

        // Test NIN table (correct structure with ninData JSONB field)
        await queryRunner.query(\`
            CREATE TABLE "test_nins" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "nin" character varying(11) NOT NULL,
                "ninData" jsonb NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_test_nin" UNIQUE ("nin"),
                CONSTRAINT "PK_test_nins" PRIMARY KEY ("id")
            )
        \`);`;

    indexCreation = `
        // Create indexes
        await queryRunner.query(\`CREATE INDEX "IDX_users_email" ON "users" ("emailAddress")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_users_phone" ON "users" ("phoneNumber")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_users_state" ON "users" ("stateId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_users_lga" ON "users" ("lgaId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_users_ward" ON "users" ("wardId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_users_group" ON "users" ("groupId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_countries_code" ON "countries" ("code")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_states_country" ON "states" ("countryId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_lgas_state" ON "lgas" ("stateId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_wards_lga" ON "wards" ("lgaId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_otps_email_otp" ON "otps" ("email", "otp")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_test_nins_nin" ON "test_nins" ("nin")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_logs_user" ON "logs" ("userId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_logs_entity" ON "logs" ("entity", "entityId")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_tokens_token_name" ON "tokens" ("tokenName")\`);`;

    tableDrop = `
        await queryRunner.query(\`DROP TABLE "test_nins"\`);
        await queryRunner.query(\`DROP TABLE "tokens"\`);
        await queryRunner.query(\`DROP TABLE "otps"\`);
        await queryRunner.query(\`DROP TABLE "logs"\`);
        await queryRunner.query(\`DROP TABLE "notifications"\`);
        await queryRunner.query(\`DROP TABLE "users"\`);
        await queryRunner.query(\`DROP TABLE "application_files"\`);
        await queryRunner.query(\`DROP TABLE "roles"\`);
        await queryRunner.query(\`DROP TABLE "groups"\`);
        await queryRunner.query(\`DROP TABLE "zones"\`);
        await queryRunner.query(\`DROP TABLE "wards"\`);
        await queryRunner.query(\`DROP TABLE "lgas"\`);
        await queryRunner.query(\`DROP TABLE "states"\`);
        await queryRunner.query(\`DROP TABLE "countries"\`);`;
  } else {
    // NestJS Template with basic models
    tableCreation = `
        // Users table
        await queryRunner.query(\`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                CONSTRAINT "UQ_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        \`);`;

    indexCreation = `
        await queryRunner.query(\`CREATE INDEX "IDX_users_email" ON "users" ("email")\`);
        await queryRunner.query(\`CREATE INDEX "IDX_users_isActive" ON "users" ("isActive")\`);`;

    tableDrop = `
        await queryRunner.query(\`DROP INDEX "IDX_users_isActive"\`);
        await queryRunner.query(\`DROP INDEX "IDX_users_email"\`);
        await queryRunner.query(\`DROP TABLE "users"\`);`;
  }

  const migrationContent = `import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration${timestamp} implements MigrationInterface {
    name = 'InitialMigration${timestamp}'

    public async up(queryRunner: QueryRunner): Promise<void> {${tableCreation}
        
        // Add indexes${indexCreation}
    }

    public async down(queryRunner: QueryRunner): Promise<void> {${tableDrop}
    }
}
`;

  fs.writeFileSync(path.join(migrationDir, `${migrationName}.ts`), migrationContent);
}

async function generateSequelizeMigration(migrationDir, timestamp, answers) {
  const migrationName = `${timestamp}-initial-migration.js`;
  const isBTL = answers.template === "Enterprise API (NestJS)";
  
  let migrationContent;
  
  if (isBTL) {
    // Enterprise API template with comprehensive models using auto-increment integers
    migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Countries table
    await queryInterface.createTable('countries', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      code: { type: Sequelize.STRING(3), allowNull: false, unique: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // States table
    await queryInterface.createTable('states', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      code: { type: Sequelize.STRING(10), allowNull: false },
      countryId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'countries', key: 'id' }, field: 'country_id' },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // LGAs table
    await queryInterface.createTable('lgas', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      code: { type: Sequelize.STRING(10), allowNull: false },
      stateId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'states', key: 'id' }, field: 'state_id' },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Wards table
    await queryInterface.createTable('wards', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      code: { type: Sequelize.STRING(10), allowNull: false },
      lgaId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'lgas', key: 'id' }, field: 'lga_id' },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Zones table
    await queryInterface.createTable('zones', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Groups table
    await queryInterface.createTable('groups', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Roles table
    await queryInterface.createTable('roles', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      permissions: { type: Sequelize.JSONB, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Application Files table
    await queryInterface.createTable('application_files', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      key: { type: Sequelize.TEXT, allowNull: false },
      eTag: { type: Sequelize.TEXT, allowNull: false, field: 'e_tag' },
      mimeType: { type: Sequelize.TEXT, allowNull: false, field: 'mime_type' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Users table (comprehensive with all fields using integer IDs)
    await queryInterface.createTable('users', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      firstName: { type: Sequelize.STRING(50), allowNull: true, field: 'first_name' },
      lastName: { type: Sequelize.STRING(50), allowNull: true, field: 'last_name' },
      middleName: { type: Sequelize.STRING(50), allowNull: true, field: 'middle_name' },
      gender: { type: Sequelize.INTEGER, allowNull: true },
      phoneNumber: { type: Sequelize.STRING(15), allowNull: true, field: 'phone_number' },
      emailAddress: { type: Sequelize.STRING(50), allowNull: false, field: 'email' },
      nin: { type: Sequelize.STRING(11), allowNull: true },
      profileImageId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'application_files', key: 'id' }, field: 'profile_image' },
      zoneId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'zones', key: 'id' }, field: 'zone' },
      stateId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'states', key: 'id' }, field: 'state_id' },
      lgaId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'lgas', key: 'id' }, field: 'lga_id' },
      wardId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'wards', key: 'id' }, field: 'ward_id' },
      groupId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'groups', key: 'id' }, field: 'group_id' },
      password: { type: Sequelize.STRING, allowNull: true },
      verified: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
      requirePasswordChange: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false, field: 'require_password_change' },
      twoFactorSecret: { type: Sequelize.STRING, allowNull: true, field: 'two_factor_secret' },
      isTwoFactorEnabled: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false, field: 'is_two_factor_enabled' },
      roleId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'roles', key: 'id' }, field: 'role_id' },
      status: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Notifications table
    await queryInterface.createTable('notifications', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      status: { type: Sequelize.INTEGER, allowNull: false },
      to: { type: Sequelize.STRING(50), allowNull: false },
      from: { type: Sequelize.STRING(100), allowNull: false },
      subject: { type: Sequelize.STRING(100), allowNull: false },
      text: { type: Sequelize.TEXT, allowNull: false },
      seen: { type: Sequelize.BOOLEAN, allowNull: false },
      type: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Logs table
    await queryInterface.createTable('logs', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      action: { type: Sequelize.STRING, allowNull: false },
      entity: { type: Sequelize.STRING, allowNull: false },
      entityId: { type: Sequelize.INTEGER, allowNull: true, field: 'entity_id' },
      userId: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, field: 'user_id' },
      details: { type: Sequelize.JSONB, allowNull: true },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // OTP table
    await queryInterface.createTable('otps', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      email: { type: Sequelize.STRING(50), allowNull: true },
      otp: { type: Sequelize.STRING(10), allowNull: false },
      otpIssuedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW, field: 'otp_issued_at' },
      isUsed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_used' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Token table
    await queryInterface.createTable('tokens', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      token: { type: Sequelize.TEXT, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, field: 'user_id' },
      expiresAt: { type: Sequelize.DATE, allowNull: false, field: 'expires_at' },
      used: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Test NIN table
    await queryInterface.createTable('test_nins', {
      id: { allowNull: false, primaryKey: true, type: Sequelize.INTEGER, autoIncrement: true },
      nin: { type: Sequelize.STRING(11), allowNull: false, unique: true },
      ninData: { type: Sequelize.JSONB, allowNull: false, field: 'nin_data' },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'created_at' },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW, field: 'updated_at' },
      deletedAt: { allowNull: true, type: Sequelize.DATE, field: 'deleted_at' }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['phone_number'], { unique: true, name: 'users_unique_phone_number' });
    await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_unique_email' });
    await queryInterface.addIndex('users', ['state_id']);
    await queryInterface.addIndex('users', ['lga_id']);
    await queryInterface.addIndex('users', ['ward_id']);
    await queryInterface.addIndex('users', ['group_id']);
    await queryInterface.addIndex('countries', ['code'], { unique: true });
    await queryInterface.addIndex('states', ['country_id']);
    await queryInterface.addIndex('lgas', ['state_id']);
    await queryInterface.addIndex('wards', ['lga_id']);
    await queryInterface.addIndex('otps', ['email', 'otp'], { unique: true, name: 'otp_un' });
    await queryInterface.addIndex('test_nins', ['nin'], { unique: true, name: 'test_nins_nin_unique' });
    await queryInterface.addIndex('logs', ['user_id']);
    await queryInterface.addIndex('logs', ['entity', 'entity_id']);
    await queryInterface.addIndex('tokens', ['user_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('test_nins');
    await queryInterface.dropTable('tokens');
    await queryInterface.dropTable('otps');
    await queryInterface.dropTable('logs');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('application_files');
    await queryInterface.dropTable('roles');
    await queryInterface.dropTable('groups');
    await queryInterface.dropTable('zones');
    await queryInterface.dropTable('wards');
    await queryInterface.dropTable('lgas');
    await queryInterface.dropTable('states');
    await queryInterface.dropTable('countries');
  }
};
`;
  } else {
    // NestJS Template with basic models using auto-increment integers
    migrationContent = `'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Add indexes
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['isActive']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
`;
  }

  fs.writeFileSync(path.join(migrationDir, migrationName), migrationContent);
}

async function generatePrismaMigration(targetDir, answers) {
  // For Prisma, we create a migration using prisma migrate
  // The schema is already in place, so we just need to create the migration directory structure
  const prismaDir = path.join(targetDir, "prisma");
  const migrationDir = path.join(prismaDir, "migrations");
  
  fs.ensureDirSync(migrationDir);
  
  // Create a README for Prisma migrations
  const migrationReadme = `# Database Migrations

This directory contains Prisma migrations.

## Commands:
- Generate migration: \`npx prisma migrate dev --name init\`
- Apply migrations: \`npx prisma migrate deploy\`
- Reset database: \`npx prisma migrate reset\`
- Generate client: \`npx prisma generate\`

## First Migration:
After setting up your database connection, run:
\`\`\`bash
npx prisma migrate dev --name initial_migration
\`\`\`
`;

  fs.writeFileSync(path.join(migrationDir, "README.md"), migrationReadme);
}

async function customizeEnterpriseAPITemplate(targetDir, answers) {
  // Customize package.json for Enterprise API template
  await customizeEnterpriseAPIPackageJson(targetDir, answers);

  // Customize environment variables
  await customizeEnterpriseAPIEnvironment(targetDir, answers);

  // Customize auth guards based on selections
  await customizeEnterpriseAPIAuthGuards(targetDir, answers);

  // Generate PM2 configuration if enabled
  if (answers.enablePM2tools) {
    await generateEnterpriseAPIPM2Config(targetDir, answers);
  }

  // Setup comprehensive unit testing if enabled
  if (answers.enableUnitTesting) {
    await setupEnterpriseAPIUnitTesting(targetDir, answers);
  }

  // Install dependencies for Enterprise API template
  console.log("📥 Installing dependencies...");
  await installEnterpriseAPIDependencies(targetDir, answers);
}

async function customizeEnterpriseAPIPackageJson(targetDir, answers) {
  const packageJsonPath = path.join(targetDir, "api/package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.name = answers.appName;
  packageJson.description = `${answers.appName} - A NestJS application based on Enterprise API template`;

  // Update ORM dependencies based on selection
  if (answers.orm !== "TypeORM") {
    // Remove TypeORM dependencies if not selected
    delete packageJson.dependencies?.typeorm;
    delete packageJson.dependencies?.["@nestjs/typeorm"];
    delete packageJson.devDependencies?.typeorm;
    delete packageJson.devDependencies?.["@nestjs/typeorm"];
  }

  // Add selected ORM dependencies
  switch (answers.orm) {
    case "Sequelize":
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies["@nestjs/sequelize"] = "^10.0.1";
      packageJson.dependencies["sequelize"] = "^6.37.3";
      packageJson.dependencies["sequelize-typescript"] = "^2.1.6";
      
      // Add database driver
      if (answers.db === "PostgreSQL") {
        packageJson.dependencies.pg = "^8.12.0";
        packageJson.dependencies["pg-hstore"] = "^2.3.4";
        packageJson.devDependencies = packageJson.devDependencies || {};
        packageJson.devDependencies["@types/pg"] = "^8.11.6";
      } else if (answers.db === "MySQL") {
        packageJson.dependencies.mysql2 = "^3.11.0";
      }
      
      // Add Sequelize CLI for development
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies["sequelize-cli"] = "^6.6.2";
      break;
      
    case "Prisma":
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies["@prisma/client"] = "^5.1.1";
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies.prisma = "^5.1.1";
      break;
      
    case "None":
      // Remove all ORM dependencies
      delete packageJson.dependencies?.typeorm;
      delete packageJson.dependencies?.["@nestjs/typeorm"];
      delete packageJson.dependencies?.["@nestjs/sequelize"];
      delete packageJson.dependencies?.sequelize;
      delete packageJson.dependencies?.["sequelize-typescript"];
      delete packageJson.dependencies?.["@prisma/client"];
      delete packageJson.devDependencies?.prisma;
      break;
  }

  // Clean up all ORM-specific scripts first
  packageJson.scripts = packageJson.scripts || {};
  
  // Remove all TypeORM scripts
  delete packageJson.scripts["typeorm"];
  delete packageJson.scripts["migration:create"];
  delete packageJson.scripts["migration:drop"];
  delete packageJson.scripts["migration:reset"];
  delete packageJson.scripts["migration:sync"];
  delete packageJson.scripts["migration:show"];
  delete packageJson.scripts["schema:drop"];
  
  // Remove all Sequelize scripts
  delete packageJson.scripts["migration:undo"];
  delete packageJson.scripts["migration:undo:all"];
  
  // Remove all Prisma scripts
  delete packageJson.scripts["migration:deploy"];
  delete packageJson.scripts["migration:status"];
  delete packageJson.scripts["db:generate"];
  delete packageJson.scripts["db:studio"];
  delete packageJson.scripts["db:seed"];
  
  // Add ORM-specific scripts based on selection
  switch (answers.orm) {
    case "TypeORM":
      packageJson.scripts["typeorm"] = "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js";
      packageJson.scripts["migration:generate"] = "npm run typeorm migration:generate -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:create"] = "npm run typeorm migration:create";
      packageJson.scripts["migration:run"] = "npm run typeorm migration:run -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:revert"] = "npm run typeorm migration:revert -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:show"] = "npm run typeorm migration:show -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:drop"] = "npm run typeorm schema:drop -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:reset"] = "npm run typeorm schema:drop -- -d ./src/config/typeorm.config.ts && npm run typeorm schema:sync -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:sync"] = "npm run typeorm schema:sync -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["seed:run"] = "ts-node ./node_modules/typeorm-extension/bin/cli.cjs seed:run -d ./src/config/typeorm.config.ts";
      break;
      
    case "Sequelize":
      packageJson.scripts["migration:generate"] = "sequelize-cli migration:generate --name";
      packageJson.scripts["migration:run"] = "sequelize-cli db:migrate";
      packageJson.scripts["migration:undo"] = "sequelize-cli db:migrate:undo";
      packageJson.scripts["migration:undo:all"] = "sequelize-cli db:migrate:undo:all";
      packageJson.scripts["seed:run"] = "sequelize-cli db:seed:all";
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies["sequelize-cli"] = "^6.6.2";
      break;
      
    case "Prisma":
      packageJson.scripts["migration:generate"] = "prisma migrate dev";
      packageJson.scripts["migration:deploy"] = "prisma migrate deploy";
      packageJson.scripts["migration:reset"] = "prisma migrate reset";
      packageJson.scripts["migration:status"] = "prisma migrate status";
      packageJson.scripts["migration:run"] = "prisma migrate deploy";
      packageJson.scripts["db:generate"] = "prisma generate";
      packageJson.scripts["db:studio"] = "prisma studio";
      packageJson.scripts["db:seed"] = "prisma db seed";
      packageJson.scripts["seed:run"] = "prisma db seed";
      break;
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function customizeEnterpriseAPIEnvironment(targetDir, answers) {
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
    case "MSSQL":
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=1433");
      envContent = envContent.replace(/DB_USERNAME=.*/, "DB_USERNAME=sa");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=YourPassword123");
      envContent = envContent.replace(
        /DB_NAME=.*/,
        `DB_NAME=${answers.appName}`
      );
      break;
    case "MongoDB":
      // For MongoDB, we use different environment variables
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=27017");
      envContent = envContent.replace(/DB_USERNAME=.*/, "# DB_USERNAME=admin");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "# DB_PASSWORD=password");
      envContent = envContent.replace(
        /DB_NAME=.*/,
        `DB_NAME=${answers.appName}`
      );
      // Add MongoDB connection string
      if (!envContent.includes("DATABASE_URL")) {
        envContent += `\nDATABASE_URL=mongodb://localhost:27017/${answers.appName}`;
      } else {
        envContent = envContent.replace(
          /DATABASE_URL=.*/,
          `DATABASE_URL=mongodb://localhost:27017/${answers.appName}`
        );
      }
      break;
    case "SQLite":
      // SQLite doesn't need host, port, username, password
      envContent = envContent.replace(/DB_HOST=.*/, "# DB_HOST=not_required_for_sqlite");
      envContent = envContent.replace(/DB_PORT=.*/, "# DB_PORT=not_required_for_sqlite");
      envContent = envContent.replace(/DB_USERNAME=.*/, "# DB_USERNAME=not_required_for_sqlite");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "# DB_PASSWORD=not_required_for_sqlite");
      envContent = envContent.replace(
        /DB_NAME=.*/,
        `DB_NAME=${answers.appName}.db`
      );
      // Add SQLite database path
      if (!envContent.includes("DATABASE_URL")) {
        envContent += `\nDATABASE_URL=file:./${answers.appName}.db`;
      } else {
        envContent = envContent.replace(
          /DATABASE_URL=.*/,
          `DATABASE_URL=file:./${answers.appName}.db`
        );
      }
      break;
  }

  fs.writeFileSync(envExamplePath, envContent);
  fs.writeFileSync(path.join(targetDir, "api/.env"), envContent);
}

async function customizeEnterpriseAPIAuthGuards(targetDir, answers) {
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

async function installEnterpriseAPIDependencies(targetDir, answers) {
  // Enterprise API template uses Makefile for dependency management
  try {
    console.log("Installing Enterprise API template dependencies using Makefile...");
    execSync(`cd ${targetDir} && make install`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error installing dependencies:", error.message);
    console.log("You can install them manually by running:");
    console.log(`cd ${path.basename(targetDir)}`);
    console.log(`make install`);
  }
}

async function generateEnterpriseAPIPM2Config(targetDir, answers) {
  const pm2Config = `module.exports = {
  apps: [
    {
      name: '${answers.appName}-api',
      script: 'api/dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'api/logs'],
      error_file: './logs/api-err.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max_old_space_size=4096'
    },
    {
      name: '${answers.appName}-email',
      script: 'email-service/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      cwd: process.cwd(),
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      error_file: './logs/email-err.log',
      out_file: './logs/email-out.log',
      log_file: './logs/email-combined.log',
      time: true,
      max_memory_restart: '512M'
    }
  ]
};`;

  fs.writeFileSync(path.join(targetDir, "ecosystem.config.cjs"), pm2Config);
  
  // Create logs directory
  fs.mkdirSync(path.join(targetDir, "logs"), { recursive: true });
  
  // Update Makefile with PM2 commands
  const makefilePath = path.join(targetDir, "Makefile");
  if (fs.existsSync(makefilePath)) {
    let makefileContent = fs.readFileSync(makefilePath, "utf8");
    
    const pm2Commands = `

# PM2 Process Management
pm2-start:
\tpm2 start ecosystem.config.cjs

pm2-stop:
\tpm2 stop ecosystem.config.cjs

pm2-restart:
\tpm2 restart ecosystem.config.cjs

pm2-delete:
\tpm2 delete ecosystem.config.cjs

pm2-status:
\tpm2 status

pm2-logs:
\tpm2 logs`;

    makefileContent += pm2Commands;
    fs.writeFileSync(makefilePath, makefileContent);
  }
}

async function setupEnterpriseAPIUnitTesting(targetDir, answers) {
  // Update package.json for comprehensive testing
  const apiPackageJsonPath = path.join(targetDir, "api/package.json");
  const apiPackageJson = JSON.parse(fs.readFileSync(apiPackageJsonPath, "utf8"));

  // Update Jest configuration for comprehensive testing
  apiPackageJson.jest = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest'
    },
    collectCoverageFrom: [
      '**/*.(t|j)s',
      '!**/*.module.ts',
      '!**/main.ts'
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };

  // Add test scripts
  apiPackageJson.scripts = {
    ...apiPackageJson.scripts,
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  };

  fs.writeFileSync(apiPackageJsonPath, JSON.stringify(apiPackageJson, null, 2));

  // Create comprehensive test files for Enterprise API template
  await createEnterpriseAPITestFiles(targetDir, answers);

  // Update Makefile with test commands
  const makefilePath = path.join(targetDir, "Makefile");
  if (fs.existsSync(makefilePath)) {
    let makefileContent = fs.readFileSync(makefilePath, "utf8");
    
    const testCommands = `

# Testing Commands
test:
\tyarn --cwd api test

test-watch:
\tyarn --cwd api test:watch

test-coverage:
\tyarn --cwd api test:cov

test-e2e:
\tyarn --cwd api test:e2e`;

    makefileContent += testCommands;
    fs.writeFileSync(makefilePath, makefileContent);
  }
}

async function createEnterpriseAPITestFiles(targetDir, answers) {
  const apiTestDir = path.join(targetDir, "api/src");
  const e2eTestDir = path.join(targetDir, "api/test");
  fs.ensureDirSync(e2eTestDir);

  // App Controller Test
  const appControllerTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return application info', () => {
      const result = appController.getHello();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('OK');
    });
  });
});`;

  fs.writeFileSync(path.join(apiTestDir, "app.controller.spec.ts"), appControllerTestContent);

  // App Service Test
  const appServiceTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return application info', () => {
      const result = service.getHello();
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = service.getHealth();
      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('OK');
      expect(result).toHaveProperty('timestamp');
    });
  });
});`;

  fs.writeFileSync(path.join(apiTestDir, "app.service.spec.ts"), appServiceTestContent);

  // E2E Test for Enterprise API Template
  const e2eTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('timestamp');
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status');
        expect(res.body.status).toBe('OK');
      });
  });

  ${answers.enableJwtAuth ? `
  describe('Authentication (JWT)', () => {
    it('/api/auth/login (POST) - should require credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });

    it('/api/auth/register (POST) - should validate input', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        })
        .expect(400);
    });

    it('/api/protected (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/protected')
        .expect(401);
    });
  });
  ` : ""}

  ${answers.enableXSignature ? `
  describe('X-Signature Authentication', () => {
    it('should reject requests without X-Signature', () => {
      return request(app.getHttpServer())
        .get('/api/secure-endpoint')
        .expect(401);
    });

    it('should reject requests with invalid X-Signature', () => {
      return request(app.getHttpServer())
        .get('/api/secure-endpoint')
        .set('X-Signature', 'invalid-signature')
        .expect(401);
    });
  });
  ` : ""}

  ${answers.db ? `
  describe('Database Health', () => {
    it('/api/health/database (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/health/database')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('database');
          expect(res.body.database).toBe('connected');
        });
    });
  });
  ` : ""}

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle malformed JSON', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });
});`;

  fs.writeFileSync(path.join(e2eTestDir, "app.e2e-spec.ts"), e2eTestContent);

  // Jest E2E Configuration for Enterprise API
  const jestE2eConfig = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testEnvironment: 'node',
    testRegex: '.e2e-spec.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/test-setup.ts']
  };

  fs.writeFileSync(path.join(e2eTestDir, "jest-e2e.json"), JSON.stringify(jestE2eConfig, null, 2));

  // Test setup for Enterprise API
  const testSetupContent = `import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

// Global test setup for Enterprise API template
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = 'localhost';
  process.env.DB_PORT = '5432';
  process.env.DB_USERNAME = 'test';
  process.env.DB_PASSWORD = 'test';
  process.env.DB_NAME = 'test_db';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.PRE_SHARED_API_KEY = 'test-api-key';
});

// Global test utilities
export class TestHelpers {
  static async createTestModule() {
    return await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  }

  static generateJWTToken(): string {
    return 'test-jwt-token';
  }

  static generateValidXSignature(): string {
    return 'test-valid-signature';
  }

  static createMockUser() {
    return {
      id: 1,
      email: 'test@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static createMockRequest(data: any = {}) {
    return {
      body: data,
      headers: {},
      user: null,
      ...data
    };
  }
}`;

  fs.writeFileSync(path.join(e2eTestDir, "test-setup.ts"), testSetupContent);

  // Auth Service Test (if JWT is enabled)
  if (answers.enableJwtAuth) {
    const authServiceTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn().mockReturnValue({ userId: 1 }),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user data for valid credentials', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid credentials', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const result = await service.login(mockUser);

      expect(result).toHaveProperty('access_token');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });
});`;

    // Check if auth directory exists
    const authDir = path.join(targetDir, "api/src/auth");
    if (fs.existsSync(authDir)) {
      fs.writeFileSync(path.join(authDir, "auth.service.spec.ts"), authServiceTestContent);
    }
  }
}

async function customizeNestJSTemplate(targetDir, answers) {
  // Customize package.json for NestJS template
  await customizeNestJSPackageJson(targetDir, answers);

  // Customize environment variables
  await customizeNestJSEnvironment(targetDir, answers);

  // Customize auth modules based on selections
  await customizeNestJSAuthModules(targetDir, answers);

  // Generate PM2 configuration if enabled
  if (answers.enablePM2tools) {
    await generatePM2Config(targetDir, answers);
  }

  // Setup comprehensive unit testing if enabled
  if (answers.enableUnitTesting) {
    await setupUnitTesting(targetDir, answers);
  }

  // Install dependencies for NestJS template
  console.log("📥 Installing dependencies...");
  await installNestJSDependencies(targetDir, answers);
}

async function customizeNestJSPackageJson(targetDir, answers) {
  const packageJsonPath = path.join(targetDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.name = answers.appName;
  packageJson.description = `${answers.appName} - A NestJS application`;

  // Update ORM dependencies based on selection
  if (answers.orm !== "TypeORM") {
    // Remove TypeORM dependencies if not selected
    delete packageJson.dependencies?.typeorm;
    delete packageJson.dependencies?.["@nestjs/typeorm"];
    delete packageJson.devDependencies?.typeorm;
    delete packageJson.devDependencies?.["@nestjs/typeorm"];
  }

  // Add selected ORM dependencies
  switch (answers.orm) {
    case "Sequelize":
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies["@nestjs/sequelize"] = "^10.0.1";
      packageJson.dependencies["sequelize"] = "^6.37.3";
      packageJson.dependencies["sequelize-typescript"] = "^2.1.6";
      
      // Add database driver
      if (answers.db === "PostgreSQL") {
        packageJson.dependencies.pg = "^8.12.0";
        packageJson.dependencies["pg-hstore"] = "^2.3.4";
        packageJson.devDependencies = packageJson.devDependencies || {};
        packageJson.devDependencies["@types/pg"] = "^8.11.6";
      } else if (answers.db === "MySQL") {
        packageJson.dependencies.mysql2 = "^3.11.0";
      }
      
      // Add Sequelize CLI for development
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies["sequelize-cli"] = "^6.6.2";
      break;
      
    case "Prisma":
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.dependencies["@prisma/client"] = "^5.1.1";
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies.prisma = "^5.1.1";
      break;
      
    case "None":
      // Remove all ORM dependencies
      delete packageJson.dependencies?.typeorm;
      delete packageJson.dependencies?.["@nestjs/typeorm"];
      delete packageJson.dependencies?.["@nestjs/sequelize"];
      delete packageJson.dependencies?.sequelize;
      delete packageJson.dependencies?.["sequelize-typescript"];
      delete packageJson.dependencies?.["@prisma/client"];
      delete packageJson.devDependencies?.prisma;
      break;
  }

  // Clean up all ORM-specific scripts first
  packageJson.scripts = packageJson.scripts || {};
  
  // Remove all TypeORM scripts
  delete packageJson.scripts["typeorm"];
  delete packageJson.scripts["migration:create"];
  delete packageJson.scripts["migration:drop"];
  delete packageJson.scripts["migration:reset"];
  delete packageJson.scripts["migration:sync"];
  delete packageJson.scripts["migration:show"];
  delete packageJson.scripts["schema:drop"];
  
  // Remove all Sequelize scripts
  delete packageJson.scripts["migration:undo"];
  delete packageJson.scripts["migration:undo:all"];
  
  // Remove all Prisma scripts
  delete packageJson.scripts["migration:deploy"];
  delete packageJson.scripts["migration:status"];
  delete packageJson.scripts["db:generate"];
  delete packageJson.scripts["db:studio"];
  delete packageJson.scripts["db:seed"];
  
  // Add ORM-specific scripts based on selection
  switch (answers.orm) {
    case "TypeORM":
      packageJson.scripts["typeorm"] = "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js";
      packageJson.scripts["migration:generate"] = "npm run typeorm migration:generate -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:create"] = "npm run typeorm migration:create";
      packageJson.scripts["migration:run"] = "npm run typeorm migration:run -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:revert"] = "npm run typeorm migration:revert -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:show"] = "npm run typeorm migration:show -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:drop"] = "npm run typeorm schema:drop -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:reset"] = "npm run typeorm schema:drop -- -d ./src/config/typeorm.config.ts && npm run typeorm schema:sync -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["migration:sync"] = "npm run typeorm schema:sync -- -d ./src/config/typeorm.config.ts";
      packageJson.scripts["seed:run"] = "ts-node ./node_modules/typeorm-extension/bin/cli.cjs seed:run -d ./src/config/typeorm.config.ts";
      break;
      
    case "Sequelize":
      packageJson.scripts["migration:generate"] = "sequelize-cli migration:generate --name";
      packageJson.scripts["migration:run"] = "sequelize-cli db:migrate";
      packageJson.scripts["migration:undo"] = "sequelize-cli db:migrate:undo";
      packageJson.scripts["migration:undo:all"] = "sequelize-cli db:migrate:undo:all";
      packageJson.scripts["seed:run"] = "sequelize-cli db:seed:all";
      packageJson.devDependencies = packageJson.devDependencies || {};
      packageJson.devDependencies["sequelize-cli"] = "^6.6.2";
      break;
      
    case "Prisma":
      packageJson.scripts["migration:generate"] = "prisma migrate dev";
      packageJson.scripts["migration:deploy"] = "prisma migrate deploy";
      packageJson.scripts["migration:reset"] = "prisma migrate reset";
      packageJson.scripts["migration:status"] = "prisma migrate status";
      packageJson.scripts["migration:run"] = "prisma migrate deploy";
      packageJson.scripts["db:generate"] = "prisma generate";
      packageJson.scripts["db:studio"] = "prisma studio";
      packageJson.scripts["db:seed"] = "prisma db seed";
      packageJson.scripts["seed:run"] = "prisma db seed";
      break;
  }

  // Add PM2 scripts if enabled
  if (answers.enablePM2tools) {
    packageJson.scripts = {
      ...packageJson.scripts,
      "pm2:start": "pm2 start ecosystem.config.cjs",
      "pm2:stop": "pm2 stop ecosystem.config.cjs",
      "pm2:restart": "pm2 restart ecosystem.config.cjs",
      "pm2:delete": "pm2 delete ecosystem.config.cjs"
    };
  }

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

async function customizeNestJSEnvironment(targetDir, answers) {
  const envExamplePath = path.join(targetDir, ".env.example");
  let envContent = fs.readFileSync(envExamplePath, "utf8");

  // Update app name in env
  envContent = envContent.replace(/APP_NAME=.*/, `APP_NAME=${answers.appName}`);

  // Add/remove auth-related variables based on selections
  if (!answers.enableJwtAuth) {
    // Comment out JWT-related variables if JWT is disabled
    envContent = envContent.replace(/^JWT_SECRET=/, "#JWT_SECRET=");
    envContent = envContent.replace(/^JWT_EXPIRES_IN=/, "#JWT_EXPIRES_IN=");
  }

  if (!answers.enableXSignature) {
    // Comment out X-Signature variables
    envContent = envContent.replace(/PRE_SHARED_API_KEY=.*/, `# PRE_SHARED_API_KEY=UPDATE_ME`);
  }

  // Update database configuration
  switch (answers.db) {
    case "PostgreSQL":
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=5432");
      envContent = envContent.replace(/DB_USERNAME=.*/, "DB_USERNAME=postgres");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=password");
      envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${answers.appName}`);
      break;
    case "MySQL":
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=3306");
      envContent = envContent.replace(/DB_USERNAME=.*/, "DB_USERNAME=root");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=password");
      envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${answers.appName}`);
      break;
    case "MSSQL":
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=1433");
      envContent = envContent.replace(/DB_USERNAME=.*/, "DB_USERNAME=sa");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=YourPassword123");
      envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${answers.appName}`);
      break;
    case "MongoDB":
      // For MongoDB, we use different environment variables
      envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
      envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=27017");
      envContent = envContent.replace(/DB_USERNAME=.*/, "# DB_USERNAME=admin");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "# DB_PASSWORD=password");
      envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${answers.appName}`);
      // Add MongoDB connection string
      if (!envContent.includes("DATABASE_URL")) {
        envContent += `\nDATABASE_URL=mongodb://localhost:27017/${answers.appName}`;
      } else {
        envContent = envContent.replace(
          /DATABASE_URL=.*/,
          `DATABASE_URL=mongodb://localhost:27017/${answers.appName}`
        );
      }
      break;
    case "SQLite":
      // SQLite doesn't need host, port, username, password
      envContent = envContent.replace(/DB_HOST=.*/, "# DB_HOST=not_required_for_sqlite");
      envContent = envContent.replace(/DB_PORT=.*/, "# DB_PORT=not_required_for_sqlite");
      envContent = envContent.replace(/DB_USERNAME=.*/, "# DB_USERNAME=not_required_for_sqlite");
      envContent = envContent.replace(/DB_PASSWORD=.*/, "# DB_PASSWORD=not_required_for_sqlite");
      envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${answers.appName}.db`);
      // Add SQLite database path
      if (!envContent.includes("DATABASE_URL")) {
        envContent += `\nDATABASE_URL=file:./${answers.appName}.db`;
      } else {
        envContent = envContent.replace(
          /DATABASE_URL=.*/,
          `DATABASE_URL=file:./${answers.appName}.db`
        );
      }
      break;
  }

  fs.writeFileSync(envExamplePath, envContent);
  fs.writeFileSync(path.join(targetDir, ".env"), envContent);
}

async function customizeNestJSAuthModules(targetDir, answers) {
  // Find and customize auth modules based on template structure
  const authModulePath = path.join(targetDir, "src/auth/auth.module.ts");
  
  if (fs.existsSync(authModulePath)) {
    let authModuleContent = fs.readFileSync(authModulePath, "utf8");

    if (!answers.enableJwtAuth) {
      // Comment out JWT strategy imports and providers
      authModuleContent = authModuleContent.replace(
        /import.*JwtStrategy.*from.*/,
        "// JWT authentication disabled\n// import { JwtStrategy } from './jwt.strategy';"
      );
    }

    fs.writeFileSync(authModulePath, authModuleContent);
  }

  // Customize app module if exists
  const appModulePath = path.join(targetDir, "src/app.module.ts");
  if (fs.existsSync(appModulePath)) {
    let appModuleContent = fs.readFileSync(appModulePath, "utf8");

    if (!answers.enableJwtAuth) {
      // Comment out JWT guard
      appModuleContent = appModuleContent.replace(
        /import.*JwtAuthGuard.*from.*/,
        "// JWT authentication disabled\n// import { JwtAuthGuard } from './auth/jwt-auth.guard';"
      );
    }

    fs.writeFileSync(appModulePath, appModuleContent);
  }
}

async function generatePM2Config(targetDir, answers) {
  const pm2Config = `module.exports = {
  apps: [
    {
      name: '${answers.appName}',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max_old_space_size=4096'
    }
  ]
};`;

  fs.writeFileSync(path.join(targetDir, "ecosystem.config.cjs"), pm2Config);
  
  // Create logs directory
  fs.mkdirSync(path.join(targetDir, "logs"), { recursive: true });
}

async function setupUnitTesting(targetDir, answers) {
  // Update Jest configuration for comprehensive testing
  const jestConfigPath = path.join(targetDir, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(jestConfigPath, "utf8"));

  packageJson.jest = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest'
    },
    collectCoverageFrom: [
      '**/*.(t|j)s'
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };

  fs.writeFileSync(jestConfigPath, JSON.stringify(packageJson, null, 2));

  // Create comprehensive test files for NestJS template
  await createNestJSTestFiles(targetDir, answers);
}

async function createNestJSTestFiles(targetDir, answers) {
  const testDir = path.join(targetDir, "src");
  const e2eTestDir = path.join(targetDir, "test");
  fs.ensureDirSync(e2eTestDir);

  // App Controller Test
  const appControllerTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});`;

  if (!fs.existsSync(path.join(testDir, "app.controller.spec.ts"))) {
    fs.writeFileSync(path.join(testDir, "app.controller.spec.ts"), appControllerTestContent);
  }

  // App Service Test
  const appServiceTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return "Hello World!"', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});`;

  if (!fs.existsSync(path.join(testDir, "app.service.spec.ts"))) {
    fs.writeFileSync(path.join(testDir, "app.service.spec.ts"), appServiceTestContent);
  }

  // E2E Test
  const e2eTestContent = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });

  ${answers.enableJwtAuth ? `
  describe('Authentication', () => {
    it('/auth/login (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(401); // Should fail without registered user
    });

    it('/auth/register (POST)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(201);
    });
  });
  ` : ""}

  ${answers.db ? `
  describe('Database', () => {
    it('/health/db (GET)', () => {
      return request(app.getHttpServer())
        .get('/health/db')
        .expect(200);
    });
  });
  ` : ""}
});`;

  fs.writeFileSync(path.join(e2eTestDir, "app.e2e-spec.ts"), e2eTestContent);

  // Jest E2E Configuration
  const jestE2eConfig = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testEnvironment: 'node',
    testRegex: '.e2e-spec.ts$',
    transform: {
      '^.+\\.(t|j)s$': 'ts-jest'
    }
  };

  fs.writeFileSync(path.join(e2eTestDir, "jest-e2e.json"), JSON.stringify(jestE2eConfig, null, 2));

  // Create test utilities
  const testUtilsContent = `import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

export class TestUtils {
  static async createTestApp(moduleMetadata: any): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule(moduleMetadata).compile();
    
    const app = moduleFixture.createNestApplication();
    await app.init();
    
    return app;
  }

  static async closeApp(app: INestApplication): Promise<void> {
    if (app) {
      await app.close();
    }
  }

  static generateTestUser() {
    return {
      email: \`test-\${Date.now()}@example.com\`,
      password: 'password123'
    };
  }

  static generateAuthHeaders(token: string) {
    return {
      Authorization: \`Bearer \${token}\`
    };
  }
}`;

  fs.writeFileSync(path.join(e2eTestDir, "test-utils.ts"), testUtilsContent);
}

async function installNestJSDependencies(targetDir, answers) {
  // NestJS template uses npm for dependency management
  try {
    console.log("Installing NestJS template dependencies...");
    
    let additionalDeps = [];
    
    if (answers.enablePM2tools) {
      additionalDeps.push("pm2");
    }
    
    if (answers.enableUnitTesting) {
      additionalDeps.push("@types/jest", "jest", "ts-jest", "supertest", "@types/supertest");
    }
    
    if (additionalDeps.length > 0) {
      const installCmd = `cd ${targetDir} && npm install ${additionalDeps.join(" ")} --save-dev`;
      execSync(installCmd, { stdio: "inherit" });
    }
    
    execSync(`cd ${targetDir} && npm install`, { stdio: "inherit" });
  } catch (error) {
    console.error("Error installing dependencies:", error.message);
    console.log("You can install them manually by running:");
    console.log(`cd ${path.basename(targetDir)}`);
    console.log(`npm install`);
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
module.exports = { customizeEnterpriseAPIAuthGuards };
