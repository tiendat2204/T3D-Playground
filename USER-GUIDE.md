# AI Regression Worker - User Guide

## Overview

AI Regression Worker is an internal platform that uses AI + Playwright to automate regression testing for websites. The system can:

- Generate test plans from requirements using AI
- Generate Playwright test code automatically
- Execute tests on real browsers
- Analyze failures with AI
- Generate bug reports automatically

---

## System Requirements

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (for background test execution)
- Modern browser (Chrome, Firefox, Edge)

---

## Quick Start

### 1. Access the Platform

Open browser and go to: `http://localhost:3000`

### 2. Configure AI Provider

1. Go to **Settings** page
2. Select your AI provider (Gemini or OpenAI)
3. Enter your API key
4. Select model
5. Click **Save Settings**

### 3. Create a Project

1. Go to **Projects** page
2. Click **New Project**
3. Enter project details:
   - Project Name
   - Base URL (e.g., https://staging.example.com)
   - Description
4. Click **Create Project**

### 4. Add Environment

1. Go to **Project Detail** page
2. Click **Add Environment**
3. Enter environment details:
   - Name (e.g., Staging, Production)
   - Base URL
4. Click **Create**

---

## Generating Test Plans

### Step 1: Open AI Generate

1. Click **AI Generate** in sidebar
2. Select your project from dropdown

### Step 2: Describe What to Test

Type in the chat box what you want to test:

```
Test login functionality with valid and invalid credentials
```

or

```
Test product management: create, edit, delete products
```

### Step 3: Generate Test Plan

1. Press **Enter** or click the send button
2. AI will generate a test plan with multiple test suites
3. Review the generated test cases

### Step 4: Generate Playwright Code

1. Click **Continue to Code Generation**
2. Select a test case from the list
3. Click the generate button
4. View the generated Playwright code
5. Click **Copy** or **Download** to save the code

---

## Running Tests

### Run Single Test

1. Go to **Test Cases** page
2. Find the test case you want to run
3. Click **Run** button
4. Select an environment
5. Click **Run Test**

### Run Tests by Tag

1. Go to **Test Cases** page
2. Click **Run by Tag**
3. Select project
4. Select environment
5. Select tags (e.g., @smoke, @regression)
6. Click **Run Tests**

### Run All Tests for a Project

1. Go to **Project Detail** page
2. Click **Run All Tests**
3. Select environment
4. Select tags (optional)
5. Click **Run Tests**

---

## Viewing Test Results

### Test Run List

1. Go to **Test Runs** page
2. View all test runs with status:
   - 🟢 **Passed** - All tests passed
   - 🔴 **Failed** - One or more tests failed
   - 🟡 **Running** - Tests are currently executing
   - ⚪ **Queued** - Tests waiting to start

### Test Run Detail

1. Click on a test run to view details
2. See summary:
   - Total tests
   - Passed count
   - Failed count
   - Duration
3. View individual test results:
   - Test case name
   - Status (passed/failed/error)
   - Duration
   - Error message (if failed)

### Re-run Failed Tests

1. Go to a failed test run detail
2. Click **Re-run Failed**
3. Only failed tests will be re-executed

---

## Analyzing Failures

### AI Failure Analysis

1. Go to a failed test run detail
2. Find the failed test result
3. Click **Analyze Failure**
4. AI will analyze the failure and provide:
   - Root cause
   - Confidence score
   - Issue type (product bug / test bug)
   - Suggested fix
5. A bug report will be automatically created

### View AI Analysis

1. Go to failed test result
2. Scroll to **AI Analysis** section
3. Review the analysis:
   - **Root Cause**: What went wrong
   - **Confidence**: How sure AI is (0-100%)
   - **Type**: Whether it's a product bug or test issue
   - **Suggested Fix**: How to fix the issue

---

## Bug Reports

### View Bug Reports

1. Go to **Bug Reports** page
2. View list of all bug reports
3. Filter by status (open, in-progress, resolved, closed)

### Create Bug Report Manually

1. Go to **Bug Reports** page
2. Click **Create Bug Report**
3. Fill in details:
   - Title
   - Steps to reproduce
   - Expected result
   - Actual result
4. Click **Create**

### Auto-Created Bug Reports

When AI analyzes a failure and determines it's a product bug, a bug report is automatically created with:
- Title from AI analysis
- Steps to reproduce
- Expected vs actual results
- AI analysis summary

---

## Test Case Management

### View Test Cases

1. Go to **Test Cases** page
2. View all test cases with:
   - Title
   - Status (draft/approved/disabled)
   - Project name
   - Tags

### Filter by Tag

1. Use the tag filter dropdown
2. Select a tag to filter test cases
3. Click **Clear filter** to show all

### Approve Test Cases

1. Go to **Test Cases** page
2. Find the test case
3. Click the menu (...)
4. Select **Approve**

### Disable Test Cases

1. Go to **Test Cases** page
2. Find the test case
3. Click the menu (...)
4. Select **Disable**

---

## Settings

### Change AI Provider

1. Go to **Settings** page
2. Select provider (Gemini or OpenAI)
3. Enter API key
4. Select model
5. Click **Save Settings**

### API Key Security

- API keys are stored in your browser's local storage
- Keys are sent to the server only when generating tests
- Keys are never stored in the database
- Clear browser data to remove keys

---

## Dashboard

The dashboard shows:

- **Total Projects**: Number of projects
- **Test Cases**: Number of test cases
- **Pass Rate**: Percentage of passing tests
- **Fail Rate**: Percentage of failing tests
- **Pass/Fail Chart**: Visual distribution
- **Recent Runs**: Latest test executions

---

## Troubleshooting

### "AI API quota exceeded"

- Wait a few minutes and try again
- Or switch to a different provider in Settings
- Or upgrade your API plan

### "No environment found"

- Go to Project Detail
- Add an environment first
- Then try running tests again

### Tests not executing

- Ensure Redis is running
- Ensure worker process is started (`pnpm dev:worker`)
- Check test run status in Test Runs page

### "Failed to generate test plan"

- Check your API key in Settings
- Ensure you have internet connection
- Try a simpler test goal

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Send message (in AI chat) | Enter |
| New line (in AI chat) | Shift + Enter |

---

## Tips for QC Team

1. **Start with Smoke Tests**: Generate @smoke tests first for critical paths

2. **Use Descriptive Goals**: Be specific when describing what to test
   - Good: "Test login with valid admin credentials"
   - Bad: "Test login"

3. **Review Generated Code**: Always review AI-generated Playwright code before running

4. **Check Environment**: Ensure environment URL is correct before running tests

5. **Use Tags**: Organize tests with tags for easy filtering and batch runs

6. **Analyze Failures**: Use AI analysis to understand why tests failed

7. **Track Bug Reports**: Bug reports are auto-created from AI analysis - review and update status

---

## Support

For issues or questions, contact the development team.
