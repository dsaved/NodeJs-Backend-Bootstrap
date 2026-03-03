#!/usr/bin/env node

const { NestFactory } = require('@nestjs/core');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const Logger = require('@nestjs/common').Logger;
const fs = require('fs');
const path = require('path');

async function generateOpenAPI() {
  try {
    Logger.log('📋 Generating OpenAPI specification...');
    
    // Disable migrations for OpenAPI generation
    process.env.AUTO_RUN_MIGRATIONS = 'false';
    
    // Create the NestJS app with minimal logging
    const { AppModule } = require('../dist/src/app.module');
    const app = await NestFactory.create(AppModule, { 
      logger: ['error', 'warn'],
      abortOnError: false,
    });

    // Create Swagger document (same config as your app)
    const config = new DocumentBuilder()
      .setTitle('License System Backend API')
      .setDescription('API for License Management System')
      .addServer('http://localhost:3000', 'Local')
      .addServer('https://api.example.com', 'Production')
      .addBearerAuth()
      .setVersion('1.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    
    // Save the spec
    const outputDir = 'generated';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const outputPath = path.join(outputDir, 'openapi.json');
    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    
    await app.close();
    
    const pathCount = Object.keys(document.paths || {}).length;
    Logger.log(`✅ Generated OpenAPI spec with ${pathCount} endpoints`);
    Logger.log(`📁 Saved to: ${outputPath}`);
    
    // Force exit to ensure all connections are closed
    setTimeout(() => process.exit(0), 100);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    setTimeout(() => process.exit(1), 100);
  }
}

generateOpenAPI();