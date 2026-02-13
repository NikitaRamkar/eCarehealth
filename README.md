# eCareHealth Test Automation

Playwright test automation framework for eCareHealth application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npx playwright test
```

### Run specific test suite
```bash
# Smoke tests
npx playwright test tests/smoke/

# Regression tests
npx playwright test tests/regression/
```

### Run specific test file
```bash
npx playwright test tests/regression/patient_chart.spec.js
```

### Run in UI mode
```bash
npx playwright test --ui
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run in debug mode
```bash
npx playwright test --debug
```

## View Test Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## CI/CD

This project includes GitHub Actions workflows for CI/CD:

1. **playwright.yml** - Runs all tests on push/PR
2. **playwright-smoke.yml** - Runs smoke tests (can be scheduled)
3. **playwright-regression.yml** - Runs regression tests (can be scheduled)

### Setting up CI/CD

1. Push your code to GitHub
2. The workflows will automatically run on:
   - Push to main/develop/master branches
   - Pull requests to main/develop/master branches
   - Manual trigger via GitHub Actions UI

### Viewing CI Results

- Go to the "Actions" tab in your GitHub repository
- Click on a workflow run to see results
- Download artifacts (test reports) from the workflow run

## Test Structure

```
tests/
├── smoke/           # Quick smoke tests
├── regression/      # Full regression test suite
└── schedulingmodule/ # Scheduling module tests
```

## Environment Variables

Create a `.env` file for environment-specific configurations:
```
BASE_URL=https://your-app-url.com
USERNAME=your-username
PASSWORD=your-password
```

## Contributing

1. Create a feature branch
2. Write tests
3. Ensure all tests pass
4. Create a pull request
