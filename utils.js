const fs = require('fs-extra');
const path = require('path');

/**
 * Creates logger utility files
 */
async function createLoggerFiles(srcDir, answers, ext) {
  const utilsDir = path.join(srcDir, "utils");
  fs.ensureDirSync(utilsDir);

  const isTs = ext === "ts";

  const loggerContent = `${isTs ? "import winston from 'winston';" : "const winston = require('winston');"}
${isTs ? "import fs from 'fs-extra';" : "const fs = require('fs-extra');"}
${isTs ? "import path from 'path';" : "const path = require('path');"}

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
fs.ensureDirSync(logsDir);

${isTs ? "const logger = winston.createLogger({" : "const logger = winston.createLogger({"}
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return \`\${timestamp} [\${level.toUpperCase()}]: \${stack || message}\`;
    })
  ),
  defaultMeta: { service: '${answers.appName}' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ level, message, timestamp }) => {
        return \`\${timestamp} [\${level}]: \${message}\`;
      })
    )
  }));
}

${isTs ? "export { logger };" : "module.exports = { logger };"}
`;

  fs.writeFileSync(path.join(utilsDir, `logger.${ext}`), loggerContent);
}

/**
 * Creates validation utility files
 */
async function createValidationFiles(srcDir, answers, ext) {
  const utilsDir = path.join(srcDir, "utils");
  fs.ensureDirSync(utilsDir);

  const isTs = ext === "ts";

  if (answers.validationLibrary === "Joi") {
    await createJoiValidationFiles(utilsDir, answers, ext, isTs);
  } else if (answers.validationLibrary === "Zod") {
    await createZodValidationFiles(utilsDir, answers, ext, isTs);
  } else if (answers.validationLibrary === "class-validator") {
    await createClassValidatorFiles(srcDir, answers, ext, isTs);
  }
}

/**
 * Creates Joi validation files
 */
async function createJoiValidationFiles(utilsDir, answers, ext, isTs) {
  const validationContent = `${isTs ? "import Joi from 'joi';" : "const Joi = require('joi');"}
${isTs ? "import { Request, Response, NextFunction } from 'express';" : ""}

// Common validation schemas
${isTs ? "export const schemas = {" : "const schemas = {"}
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  id: Joi.number().integer().positive().required(),
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }
};

// User validation schemas
${isTs ? "export const userSchemas = {" : "const userSchemas = {"}
  register: Joi.object({
    email: schemas.email,
    password: schemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  }),
  login: Joi.object({
    email: schemas.email,
    password: schemas.password
  })
};

// Validation middleware
${isTs ? `
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
` : `
const validate = (schema) => {
  return (req, res, next) => {
`}
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    
    req.body = value;
    next();
  };
};

${isTs ? "" : "module.exports = { schemas, userSchemas, validate };"}
`;

  fs.writeFileSync(path.join(utilsDir, `validation.${ext}`), validationContent);
}

/**
 * Creates Zod validation files
 */
async function createZodValidationFiles(utilsDir, answers, ext, isTs) {
  const validationContent = `${isTs ? "import { z } from 'zod';" : "const { z } = require('zod');"}
${isTs ? "import { Request, Response, NextFunction } from 'express';" : ""}

// Common validation schemas
${isTs ? "export const schemas = {" : "const schemas = {"}
  email: z.string().email(),
  password: z.string().min(6),
  id: z.number().int().positive(),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
  })
};

// User validation schemas
${isTs ? "export const userSchemas = {" : "const userSchemas = {"}
  register: z.object({
    email: schemas.email,
    password: schemas.password,
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),
  login: z.object({
    email: schemas.email,
    password: schemas.password
  })
};

// Validation middleware
${isTs ? `
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
` : `
const validate = (schema) => {
  return (req, res, next) => {
`}
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

${isTs ? "" : "module.exports = { schemas, userSchemas, validate };"}
`;

  fs.writeFileSync(path.join(utilsDir, `validation.${ext}`), validationContent);
}

/**
 * Creates class-validator files
 */
async function createClassValidatorFiles(srcDir, answers, ext, isTs) {
  const utilsDir = path.join(srcDir, "utils");
  const dtosDir = path.join(srcDir, "dto");
  fs.ensureDirSync(utilsDir);
  fs.ensureDirSync(dtosDir);

  // Create DTOs
  const userDtoContent = `${isTs ? "import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';" : "const { IsEmail, IsString, MinLength, IsOptional } = require('class-validator');"}

${isTs ? "export class RegisterDto {" : "class RegisterDto {"}
  ${isTs ? "@IsEmail()" : ""}
  ${isTs ? "email!: string;" : "email;"}

  ${isTs ? "@IsString()" : ""}
  ${isTs ? "@MinLength(6)" : ""}
  ${isTs ? "password!: string;" : "password;"}

  ${isTs ? "@IsString()" : ""}
  ${isTs ? "@MinLength(6)" : ""}
  ${isTs ? "confirmPassword!: string;" : "confirmPassword;"}
}

${isTs ? "export class LoginDto {" : "class LoginDto {"}
  ${isTs ? "@IsEmail()" : ""}
  ${isTs ? "email!: string;" : "email;"}

  ${isTs ? "@IsString()" : ""}
  ${isTs ? "@MinLength(6)" : ""}
  ${isTs ? "password!: string;" : "password;"}
}

${isTs ? "export class PaginationDto {" : "class PaginationDto {"}
  ${isTs ? "@IsOptional()" : ""}
  ${isTs ? "page?: number = 1;" : "page = 1;"}

  ${isTs ? "@IsOptional()" : ""}
  ${isTs ? "limit?: number = 10;" : "limit = 10;"}
}

${isTs ? "" : "module.exports = { RegisterDto, LoginDto, PaginationDto };"}
`;

  fs.writeFileSync(path.join(dtosDir, `user.${ext}`), userDtoContent);

  // Create validation middleware
  const validationContent = `${isTs ? "import { validate, ValidationError } from 'class-validator';" : "const { validate, ValidationError } = require('class-validator');"}
${isTs ? "import { plainToClass } from 'class-transformer';" : "const { plainToClass } = require('class-transformer');"}
${isTs ? "import { Request, Response, NextFunction } from 'express';" : ""}

${isTs ? `
export const validateDto = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
` : `
const validateDto = (dtoClass) => {
  return async (req, res, next) => {
`}
    try {
      const dto = plainToClass(dtoClass, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        const validationErrors = errors.map((error${isTs ? ": ValidationError" : ""}) => ({
          field: error.property,
          message: Object.values(error.constraints || {}).join(', ')
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: validationErrors
        });
      }

      req.body = dto;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Custom validation decorator for password confirmation
${isTs ? `
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsPasswordMatch(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isPasswordMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return \`\${args.property} must match \${relatedPropertyName}\`;
        },
      },
    });
  };
}
` : `
const { registerDecorator } = require('class-validator');

function IsPasswordMatch(property, validationOptions) {
  return function (object, propertyName) {
    registerDecorator({
      name: 'isPasswordMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, args) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = args.object[relatedPropertyName];
          return value === relatedValue;
        },
        defaultMessage(args) {
          const [relatedPropertyName] = args.constraints;
          return \`\${args.property} must match \${relatedPropertyName}\`;
        },
      },
    });
  };
}
`}

${isTs ? "" : "module.exports = { validateDto, IsPasswordMatch };"}
`;

  fs.writeFileSync(path.join(utilsDir, `validation.${ext}`), validationContent);
}

/**
 * Creates testing files
 */
async function createTestFiles(targetDir, answers, ext) {
  const testDir = path.join(targetDir, "tests");
  fs.ensureDirSync(testDir);

  const isTs = ext === "ts";

  // Jest configuration
  const jestConfig = {
    testEnvironment: "node",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    testMatch: ["**/__tests__/**/*.(js|ts)", "**/*.(test|spec).(js|ts)"],
    collectCoverageFrom: [
      "src/**/*.(js|ts)",
      "!src/**/*.d.ts"
    ]
  };

  if (isTs) {
    jestConfig.preset = "ts-jest";
    jestConfig.transform = {
      "^.+\\.ts$": "ts-jest"
    };
  }

  fs.writeFileSync(
    path.join(targetDir, "jest.config.json"),
    JSON.stringify(jestConfig, null, 2)
  );

  // Sample test file
  const testContent = `${isTs ? "import request from 'supertest';" : "const request = require('supertest');"}
${isTs ? "import app from '../src/index';" : "const app = require('../src/index');"}

describe('API Tests', () => {
  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Welcome');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  ${answers.enableAuth ? `
  describe('Authentication', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user', async () => {
        const userData = {
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        };

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(201);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.email).toBe(userData.email);
      });

      it('should not register user with invalid email', async () => {
        const userData = {
          email: 'invalid-email',
          password: 'password123',
          confirmPassword: 'password123'
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });

      ${answers.enableValidation ? `
      it('should not register user with short password', async () => {
        const userData = {
          email: 'test2@example.com',
          password: '123',
          confirmPassword: '123'
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });

      it('should not register user with mismatched passwords', async () => {
        const userData = {
          email: 'test3@example.com',
          password: 'password123',
          confirmPassword: 'differentpassword'
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData)
          .expect(400);
      });
      ` : ""}
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        // First register a user
        const userData = {
          email: 'login@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        };

        await request(app)
          .post('/api/auth/register')
          .send(userData);

        // Then login
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password
          })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
      });

      it('should not login with invalid credentials', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'nonexistent@example.com',
            password: 'wrongpassword'
          })
          .expect(401);
      });

      ${answers.enableValidation ? `
      it('should not login with invalid email format', async () => {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'invalid-email',
            password: 'password123'
          })
          .expect(400);
      });
      ` : ""}
    });
  });
  ` : ""}
});
`;

  fs.writeFileSync(path.join(testDir, `app.test.${ext}`), testContent);
}

module.exports = {
  createLoggerFiles,
  createValidationFiles,
  createTestFiles
};
