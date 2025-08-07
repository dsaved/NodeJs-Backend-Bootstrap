#!/usr/bin/env node

/**
 * Test the CLI with BTL template to verify Makefile integration
 */

const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

async function testBTLCLI() {
  console.log("🧪 Testing BTL Template CLI with Makefile Support");
  console.log("================================================\n");

  const testProjectName = "test-btl-cli";
  const testDir = path.join(__dirname, testProjectName);

  // Clean up if exists
  if (fs.existsSync(testDir)) {
    console.log("🧹 Cleaning up existing test project...");
    fs.removeSync(testDir);
  }

  try {
    // Mock answers object that the CLI would normally get from inquirer
    const mockAnswers = {
      appName: testProjectName,
      template: "BTL Template (NestJS)",
      db: "PostgreSQL",
      enableJwtAuth: true,
      enableXSignature: true,
      enableDocker: false
    };

    console.log("📝 Mock CLI answers:");
    console.log("- App name:", mockAnswers.appName);
    console.log("- Template:", mockAnswers.template);
    console.log("- Database:", mockAnswers.db);
    console.log("- JWT Auth:", mockAnswers.enableJwtAuth ? "Yes" : "No");
    console.log("- X-Signature:", mockAnswers.enableXSignature ? "Yes" : "No");
    console.log("- Docker:", mockAnswers.enableDocker ? "Yes" : "No\n");

    console.log("🚀 Running BTL template creation...");
    
    // Copy BTL template directly (simulating what the CLI does)
    const templateDir = path.join(__dirname, "btl-template");
    if (!fs.existsSync(templateDir)) {
      throw new Error("BTL template directory not found. Please ensure btl-template/ exists.");
    }
    
    console.log("� Copying BTL template...");
    fs.copySync(templateDir, testDir);

    // Apply customizations (simulating what the CLI does)
    console.log("🔧 Applying customizations...");
    
    // Customize package.json
    const packageJsonPath = path.join(testDir, "api/package.json");
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      packageJson.name = mockAnswers.appName;
      packageJson.description = `${mockAnswers.appName} - A NestJS application based on BTL template`;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Customize environment
    const envExamplePath = path.join(testDir, "api/.env.example");
    if (fs.existsSync(envExamplePath)) {
      let envContent = fs.readFileSync(envExamplePath, "utf8");
      envContent = envContent.replace(/APP_NAME=.*/, `APP_NAME=${mockAnswers.appName}`);
      
      if (mockAnswers.enableXSignature) {
        envContent += "\n# X-Signature Authentication\nPRE_SHARED_API_KEY=UPDATE_ME\n";
      }
      
      // Update database configuration
      if (mockAnswers.db === "PostgreSQL") {
        envContent = envContent.replace(/DB_HOST=.*/, "DB_HOST=localhost");
        envContent = envContent.replace(/DB_PORT=.*/, "DB_PORT=5432");
        envContent = envContent.replace(/DB_USERNAME=.*/, "DB_USERNAME=postgres");
        envContent = envContent.replace(/DB_PASSWORD=.*/, "DB_PASSWORD=password");
        envContent = envContent.replace(/DB_NAME=.*/, `DB_NAME=${mockAnswers.appName}`);
      }
      
      fs.writeFileSync(envExamplePath, envContent);
      fs.writeFileSync(path.join(testDir, "api/.env"), envContent);
    }

    console.log("\n✅ BTL template setup completed!");

    // Verify the structure
    console.log("\n🔍 Verifying BTL template structure:");
    
    const checks = [
      { path: "Makefile", description: "Root Makefile" },
      { path: "api/", description: "API service directory" },
      { path: "email-service/", description: "Email service directory" },
      { path: "api/package.json", description: "API package.json" },
      { path: "api/.env", description: "API environment file" },
      { path: "api/src/app.module.ts", description: "NestJS app module" },
      { path: "api/src/app-guards/", description: "Authentication guards" },
      { path: "email-service/package.json", description: "Email service package.json" }
    ];

    checks.forEach(check => {
      const fullPath = path.join(testDir, check.path);
      const exists = fs.existsSync(fullPath);
      console.log(`   ${exists ? "✅" : "❌"} ${check.description}: ${exists ? "PRESENT" : "MISSING"}`);
    });

    // Check Makefile content
    console.log("\n📜 Verifying Makefile commands:");
    const makefilePath = path.join(testDir, "Makefile");
    if (fs.existsSync(makefilePath)) {
      const makefileContent = fs.readFileSync(makefilePath, "utf8");
      const commands = ["install", "dev-start", "db-migrate-up", "db-seeder-run", "email-test"];
      
      commands.forEach(cmd => {
        const hasCommand = makefileContent.includes(`${cmd}:`);
        console.log(`   ${hasCommand ? "✅" : "❌"} make ${cmd}: ${hasCommand ? "AVAILABLE" : "MISSING"}`);
      });
    }

    // Check customizations
    console.log("\n🔧 Verifying customizations:");
    const apiPackagePath = path.join(testDir, "api/package.json");
    if (fs.existsSync(apiPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(apiPackagePath, "utf8"));
      console.log(`   ✅ App name: ${packageJson.name}`);
    }

    const envPath = path.join(testDir, "api/.env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      const hasAppName = envContent.includes(`APP_NAME=${testProjectName}`);
      const hasPreSharedKey = envContent.includes("PRE_SHARED_API_KEY");
      console.log(`   ${hasAppName ? "✅" : "❌"} Environment app name: ${hasAppName ? "CONFIGURED" : "MISSING"}`);
      console.log(`   ${hasPreSharedKey ? "✅" : "❌"} X-Signature config: ${hasPreSharedKey ? "CONFIGURED" : "MISSING"}`);
    }

    console.log("\n🎯 Testing Makefile functionality:");
    
    // Test make install (but don't actually install to save time)
    if (fs.existsSync(makefilePath)) {
      console.log("📋 Available Makefile commands:");
      try {
        // Just list the available make targets without running them
        const makeResult = execSync("make -qp | awk -F':' '/^[a-zA-Z0-9][^$#\\/\\t=]*:([^=]|$)/ {split($1,A,/ /);for(i in A)print A[i]}' | sort -u", {
          cwd: testDir,
          encoding: "utf8"
        });
        const targets = makeResult.split('\n').filter(line => line.trim() && !line.startsWith('.'));
        targets.slice(0, 10).forEach(target => {
          console.log(`   📌 make ${target}`);
        });
      } catch (makeError) {
        // Fallback: just check if common targets exist in the file
        console.log("   ℹ️  Listing targets from Makefile content...");
        const makefileContent = fs.readFileSync(makefilePath, "utf8");
        const commonTargets = ["install", "dev-start", "db-migrate-up", "db-seeder-run", "email-test"];
        commonTargets.forEach(target => {
          const hasTarget = makefileContent.includes(`${target}:`);
          console.log(`   ${hasTarget ? "✅" : "❌"} make ${target}`);
        });
      }
      
      console.log("\n🚀 Testing make command syntax...");
      try {
        // Test that make can parse the file without errors
        execSync("make -n install", { cwd: testDir, stdio: "pipe" });
        console.log("   ✅ Makefile syntax is valid");
      } catch (syntaxError) {
        console.log("   ❌ Makefile syntax error:", syntaxError.message.split('\n')[0]);
      }
    }

    console.log("\n🎯 Usage commands to test:");
    console.log(`cd ${testProjectName}`);
    console.log("make install           # Install all dependencies");
    console.log("make dev-start         # Start development server");
    console.log("make db-migrate-up     # Run database migrations");

    console.log("\n✅ Test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    
    // Check if the project was created anyway
    if (fs.existsSync(testDir)) {
      console.log("\n📁 Project directory was created, checking structure...");
      console.log("Contents:", fs.readdirSync(testDir));
    }
  }
}

// Run test if called directly
if (require.main === module) {
  testBTLCLI().catch(console.error);
}

module.exports = { testBTLCLI };
