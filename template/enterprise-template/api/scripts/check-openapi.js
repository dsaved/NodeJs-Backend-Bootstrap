#!/usr/bin/env node

const { NestFactory } = require('@nestjs/core');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const Logger = require('@nestjs/common').Logger;
const fs = require('fs');
const path = require('path');

async function checkOpenAPI() {
  try {
    Logger.log('🔍 Checking OpenAPI specification...');
    
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
    
    // Basic validation
    const errors = [];
    const warnings = [];
    
    // Check required fields
    if (!document.info?.title) errors.push('Missing API title');
    if (!document.info?.version) errors.push('Missing API version');
    if (!document.servers?.length) warnings.push('No servers defined');
    
    // Check endpoints
    const paths = Object.keys(document.paths || {});
    if (paths.length === 0) {
      errors.push('No API endpoints found');
    }
    
    // Check each endpoint
    let endpointsWithIssues = [];
    
    Object.entries(document.paths || {}).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const endpoint = `${method.toUpperCase()} ${path}`;
        
        // Check for missing descriptions
        if (!operation.summary && !operation.description) {
          endpointsWithIssues.push(`${endpoint} - Missing summary/description`);
        }
        
        // Check for missing responses
        if (!operation.responses || Object.keys(operation.responses).length === 0) {
          endpointsWithIssues.push(`${endpoint} - Missing response definitions`);
        }
        
        // Check POST/PUT/PATCH have request body definitions
        if (['post', 'put', 'patch'].includes(method) && !operation.requestBody) {
          endpointsWithIssues.push(`${endpoint} - Missing request body definition`);
        }
      });
    });
    
    // Save the spec for reference
    const outputDir = 'generated';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    fs.writeFileSync(path.join(outputDir, 'openapi.json'), JSON.stringify(document, null, 2));
    
    await app.close();
    
    // Report results (use console.log after app.close() since NestJS logger may be closed)
    console.log(`\n📊 Found ${paths.length} API endpoints`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS (must fix):');
      errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (endpointsWithIssues.length > 0) {
      console.log(`\n🔧 ENDPOINT ISSUES (${endpointsWithIssues.length} total):`);
      // Only show first 10 issues to avoid overwhelming output
      endpointsWithIssues.slice(0, 10).forEach(issue => console.log(`  - ${issue}`));
      if (endpointsWithIssues.length > 10) {
        console.log(`  ... and ${endpointsWithIssues.length - 10} more issues`);
      }
      console.log('\n💡 How to fix endpoint issues:');
      console.log('  1. Add @ApiOperation({ summary: "..." }) to controllers');
      console.log('  2. Add @ApiResponse({ status: 200, description: "..." }) for responses');
      console.log('  3. Add @ApiBody({ type: YourDto }) for POST/PUT/PATCH endpoints');
    }
    
    if (errors.length === 0) {
      console.log('\n✅ OpenAPI specification is valid!');
      console.log('✅ Ready for Postman/README.io import');
      console.log(`📁 Saved to: generated/openapi.json`);
      // Force exit to ensure all connections are closed
      setTimeout(() => process.exit(0), 100);
    } else {
      console.log('\n❌ Fix errors before using with external tools');
      setTimeout(() => process.exit(1), 100);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    setTimeout(() => process.exit(1), 100);
  }
}

checkOpenAPI();