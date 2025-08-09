# CI/CD Setup Guide

This repository includes automated CI/CD workflows for testing and publishing to NPM.

## Workflows

### 1. Test and Validate (`test.yml`)
- **Triggered on**: Pull requests and pushes to non-main branches
- **Purpose**: Validates code, runs tests, and checks package integrity
- **Node versions**: 18.x, 20.x

### 2. Publish to NPM (`publish.yml`)
- **Triggered on**: Pushes to `main` branch
- **Purpose**: Automatically publishes to NPM when version changes
- **Features**:
  - Version change detection
  - Multi-node testing
  - Automatic GitHub releases
  - Smart publishing (only when version is new)

## Setup Instructions

### 1. Create NPM Access Token

1. Log in to [npmjs.com](https://npmjs.com)
2. Go to **Access Tokens** in your account settings
3. Click **Generate New Token**
4. Select **Automation** token type
5. Copy the generated token

### 2. Add NPM Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your NPM access token
6. Click **Add secret**

### 3. Publishing Workflow

#### Automatic Publishing
1. Update version in `package.json`:
   ```bash
   npm version patch   # for bug fixes (1.0.0 → 1.0.1)
   npm version minor   # for new features (1.0.0 → 1.1.0)
   npm version major   # for breaking changes (1.0.0 → 2.0.0)
   ```

2. Push to main branch:
   ```bash
   git push origin main --follow-tags
   ```

3. The workflow will:
   - Run tests on Node 18.x and 20.x
   - Check if the version is new
   - Publish to NPM (if version changed)
   - Create a GitHub release
   - Notify of success/skip

#### Manual Publishing
You can also trigger the workflow manually:
1. Go to **Actions** tab in your repository
2. Select **Publish to NPM** workflow
3. Click **Run workflow**
4. Choose the branch and click **Run workflow**

## Workflow Features

### Smart Version Detection
- Automatically detects if package version has changed
- Skips publishing if version already exists on NPM
- Provides helpful feedback in workflow logs

### Multi-Node Testing
- Tests on Node.js 18.x and 20.x
- Only publishes from Node.js 20.x (latest stable)

### Automatic GitHub Releases
- Creates GitHub releases with version tags
- Includes installation and usage instructions
- Links to NPM package page

### Caching
- Caches node_modules for faster builds
- Reduces workflow execution time

## Troubleshooting

### Common Issues

1. **NPM_TOKEN not working**
   - Ensure token has **Automation** permissions
   - Check token hasn't expired
   - Verify secret name is exactly `NPM_TOKEN`

2. **Version already exists error**
   - Update version in package.json
   - Use `npm version` commands to avoid conflicts

3. **Tests failing**
   - Add test scripts to package.json if needed
   - Ensure all dependencies are in package.json

### Viewing Workflow Logs
1. Go to **Actions** tab in your repository
2. Click on the specific workflow run
3. Expand job steps to see detailed logs

## Best Practices

1. **Use semantic versioning**: patch for fixes, minor for features, major for breaking changes
2. **Test locally first**: Run `npm test` and `npm pack --dry-run` before pushing
3. **Write good commit messages**: They'll appear in the GitHub releases
4. **Keep dependencies updated**: Regularly update package dependencies

## Security

- NPM tokens are stored securely in GitHub Secrets
- Workflows only run on your repository
- No sensitive information is logged in workflow output
