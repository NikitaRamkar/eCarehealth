# CI/CD Setup Guide

This guide explains how to set up and use CI/CD for your Playwright test automation project.

## What's Included

### GitHub Actions Workflows

1. **`.github/workflows/playwright.yml`** - Main test workflow
   - Runs on push/PR to main/develop/master branches
   - Runs all tests
   - Uploads test reports as artifacts

2. **`.github/workflows/playwright-smoke.yml`** - Smoke tests
   - Runs on push/PR
   - Can be scheduled (daily at 2 AM UTC)
   - Quick validation tests

3. **`.github/workflows/playwright-regression.yml`** - Regression tests
   - Scheduled (nightly at 1 AM UTC)
   - Full regression suite
   - Can be manually triggered

## Setup Instructions

### 1. Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Add CI/CD workflows"

# Add your GitHub repository as remote
git remote add origin https://github.com/your-username/your-repo.git

# Push to GitHub
git push -u origin main
```

### 2. Verify Workflows

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. You should see the workflows listed
4. They will automatically run on push/PR

### 3. Manual Trigger

To manually trigger a workflow:
1. Go to Actions tab
2. Select the workflow (e.g., "Playwright Tests")
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Configuration

### Environment Variables

If your tests need environment variables (like credentials), add them as GitHub Secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add secrets like:
   - `TEST_USERNAME`
   - `TEST_PASSWORD`
   - `BASE_URL`

4. Update your workflow to use them:
```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    CI: true
    USERNAME: ${{ secrets.TEST_USERNAME }}
    PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

### Customizing Workflows

#### Change Test Schedule

Edit the cron expression in workflow files:
```yaml
schedule:
  - cron: '0 1 * * *'  # Daily at 1 AM UTC
```

Cron format: `minute hour day month day-of-week`

#### Change Branches

Edit the `on.push.branches` section:
```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
```

#### Change Timeout

Edit the `timeout-minutes`:
```yaml
jobs:
  test:
    timeout-minutes: 120  # 2 hours
```

## Viewing Results

### In GitHub Actions

1. Go to Actions tab
2. Click on a workflow run
3. See test results in real-time
4. Download artifacts (test reports) after completion

### Test Reports

Test reports are automatically uploaded as artifacts:
- HTML reports in `playwright-report/`
- Test results in `test-results/`

Download and view locally:
```bash
# Download artifact from GitHub Actions
# Extract and open playwright-report/index.html
```

## Alternative CI/CD Platforms

### GitLab CI

Create `.gitlab-ci.yml`:
```yaml
image: node:lts

stages:
  - test

playwright-tests:
  stage: test
  before_script:
    - npm ci
    - npx playwright install --with-deps
  script:
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 30 days
```

### Jenkins

Create `Jenkinsfile`:
```groovy
pipeline {
    agent any
    
    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npx playwright test'
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'playwright-report/**/*', fingerprint: true
        }
    }
}
```

### Azure DevOps

Create `azure-pipelines.yml`:
```yaml
trigger:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: 'lts/*'
  
- script: npm ci
  displayName: 'Install dependencies'
  
- script: npx playwright install --with-deps
  displayName: 'Install Playwright'
  
- script: npx playwright test
  displayName: 'Run tests'
  env:
    CI: true
  
- task: PublishTestResults@2
  condition: always()
  inputs:
    testResultsFiles: 'test-results/**/*.xml'
    
- task: PublishBuildArtifacts@1
  condition: always()
  inputs:
    pathToPublish: 'playwright-report'
```

## Best Practices

1. **Use Secrets** - Never commit credentials to the repository
2. **Parallel Execution** - Run tests in parallel when possible
3. **Retry Logic** - Configure retries for flaky tests
4. **Artifacts** - Always upload test reports for debugging
5. **Notifications** - Set up Slack/Email notifications for failures
6. **Scheduled Runs** - Use scheduled workflows for regression tests

## Troubleshooting

### Tests Fail in CI but Pass Locally

- Check if headless mode is enabled (it should be in CI)
- Verify environment variables are set correctly
- Check browser installation
- Review CI logs for specific errors

### Timeout Issues

- Increase `timeout-minutes` in workflow
- Increase test timeouts in `playwright.config.js`
- Check for hanging tests

### Browser Installation Fails

- Ensure `--with-deps` flag is used
- Check if running on supported OS
- Verify sufficient disk space

## Next Steps

1. Push your code to GitHub
2. Verify workflows run successfully
3. Set up notifications (optional)
4. Configure secrets if needed
5. Customize schedules as needed

For more information, see:
- [Playwright CI/CD Docs](https://playwright.dev/docs/ci)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
