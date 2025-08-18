# Template Directory Structure Guide

This document outlines how each template handles its specific directory structure in GitHub Actions workflows.

## 📁 Directory Structure Overview

### Basic Template
```
project-root/
├── src/                    # Source code
├── package.json           # Dependencies
├── package-lock.json      # Lock file
└── .github/workflows/     # GitHub Actions
```

### NestJS Template  
```
project-root/
├── src/                    # Source code
├── package.json           # Dependencies
├── package-lock.json      # Lock file
└── .github/workflows/     # GitHub Actions
```

### Enterprise API Template
```
project-root/
├── api/                    # API service
│   ├── src/               # API source code
│   ├── package.json       # API dependencies
│   └── package-lock.json  # API lock file
├── email-service/         # Email service
│   ├── package.json       # Email service dependencies
│   └── package-lock.json  # Email service lock file
├── Makefile              # Build automation
└── .github/workflows/    # GitHub Actions
```

## 🔧 Workflow Configuration Differences

### Basic Template Workflows

#### CI Workflow (`ci.yml`)
- **Working Directory**: Root (`./`)
- **Cache Path**: `package-lock.json`
- **Install Command**: `npm ci`
- **Lint/Format**: `npm run lint:check`, `npm run format:check`

#### Security Workflow (`security.yml`)
- **Scan Target**: Root `package-lock.json` or `yarn.lock`
- **OSV Scanner**: `osv-scanner --lockfile=package-lock.json`

#### Naming Conventions (`naming-conventions.yml`)
- **File Check**: `find src -name "*.ts" -o -name "*.js"`
- **Target Directory**: `src/`

---

### NestJS Template Workflows

#### CI Workflow (`ci.yml`)
- **Working Directory**: Root (`./`)
- **Cache Path**: `package-lock.json`
- **Install Command**: `npm ci`
- **Lint/Format**: `npm run lint:check`, `npm run format:check`
- **Database**: PostgreSQL service for testing

#### Security Workflow (`security.yml`)
- **Scan Target**: Root `package-lock.json` or `yarn.lock`
- **OSV Scanner**: `osv-scanner --lockfile=package-lock.json`

#### Naming Conventions (`naming-conventions.yml`)
- **File Check**: NestJS-specific patterns
- **Controller Check**: `*.controller.ts` files
- **Service Check**: `*.service.ts` files
- **Decorator Validation**: Proper decorator usage

---

### Enterprise API Template Workflows

#### CI Workflow (`ci.yml`)
- **Multi-Job Structure**: Separate jobs for API and Email Service
- **API Job**:
  - **Working Directory**: `./api`
  - **Cache Path**: `api/package-lock.json`
  - **Install Command**: `cd api && npm ci`
  - **Lint/Format**: `cd api && npm run lint:check`
- **Email Service Job**:
  - **Working Directory**: `./email-service`
  - **Cache Path**: `email-service/package-lock.json`
  - **Install Command**: `cd email-service && npm ci`

#### Security Workflow (`security.yml`)
- **Multi-Service Scanning**:
  - API: `osv-scanner --lockfile=api/package-lock.json`
  - Email Service: `osv-scanner --lockfile=email-service/package-lock.json`
- **Trivy Scanning**: Both services scanned separately

#### Naming Conventions (`naming-conventions.yml`)
- **API Files**: `find ./api/src -name "*.controller.ts"`
- **Email Service**: `find ./email-service -name "*.js"`
- **Microservice Consistency**: Validates service structure

## 🎯 Key Implementation Details

### Template Detection
```javascript
// Workflow generation based on template
if (answers.template === "Basic Template") {
  await createBasicTemplateWorkflows(workflowsDir, targetDir, answers);
} else if (answers.template === "NestJS Template") {
  await createNestJSTemplateWorkflows(workflowsDir, targetDir, answers);
} else if (answers.template === "Enterprise API (NestJS)") {
  await createEnterpriseTemplateWorkflows(workflowsDir, targetDir, answers);
}
```

### Directory-Specific Commands

#### Basic/NestJS Templates
```yaml
- name: Install dependencies
  run: npm ci

- name: Run ESLint
  run: npm run lint:check
```

#### Enterprise Template
```yaml
- name: Install API dependencies
  working-directory: ./api
  run: npm ci

- name: Run ESLint for API
  working-directory: ./api
  run: npm run lint:check

- name: Install Email Service dependencies
  working-directory: ./email-service
  run: npm ci
```

### Cache Configuration

#### Basic/NestJS
```yaml
cache: 'npm'
# Uses default package-lock.json
```

#### Enterprise
```yaml
cache: 'npm'
cache-dependency-path: 'api/package-lock.json'
# OR
cache-dependency-path: 'email-service/package-lock.json'
```

## 🛡️ Security Scanning Variations

### Single Service (Basic/NestJS)
```bash
# Check for lockfiles in root
if [ -f yarn.lock ]; then
  osv-scanner --lockfile=yarn.lock
elif [ -f package-lock.json ]; then
  osv-scanner --lockfile=package-lock.json
fi
```

### Multi-Service (Enterprise)
```bash
# API Service
if [ -f api/yarn.lock ]; then
  osv-scanner --lockfile=api/yarn.lock
elif [ -f api/package-lock.json ]; then
  osv-scanner --lockfile=api/package-lock.json
fi

# Email Service
if [ -f email-service/yarn.lock ]; then
  osv-scanner --lockfile=email-service/yarn.lock
elif [ -f email-service/package-lock.json ]; then
  osv-scanner --lockfile=email-service/package-lock.json
fi
```

## ✅ Validation

Each template's workflows are tested to ensure they:

1. **Respect Directory Structure**: Commands run in the correct directories
2. **Handle Dependencies**: Proper cache paths and install commands
3. **Scan Correctly**: Security tools target the right lockfiles
4. **Lint Appropriately**: Code quality checks run on the right source directories
5. **Test Properly**: Test commands execute in the correct context

This ensures that regardless of the template's internal structure, GitHub Actions workflows will function correctly and provide accurate feedback on code quality, security, and testing.
