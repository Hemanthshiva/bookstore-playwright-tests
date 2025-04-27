# 📚 Bookstore Application with Playwright Tests

A simple and efficient bookstore catalog application built with Angular, designed to help users browse and find books easily.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Angular](https://img.shields.io/badge/Angular-19.2.9-red.svg)

## 🌟 Features

- **Book Catalog**
  - View comprehensive list of books
  - Detailed book information including title, author, and description
  - Book cover images display

- **Search & Filter**
  - Search books by title, author, or keywords
  - Filter books by category
  - Sort functionality for better organization

- **User Interface**
  - Clean and intuitive design
  - Responsive layout for all devices
  - Easy navigation between book listings

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Angular CLI (v19.2.9)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bookstore.git
   cd bookstore
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

The application will be available at `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## 🛠️ Development

### Project Structure

```
src/
├── app/
│   ├── components/    # Reusable UI components
│   ├── services/     # Book service and data handling
│   ├── models/       # Book and category interfaces
│   └── pages/        # Main application pages
├── assets/          # Static files (images, icons)
└── environments/    # Environment configurations
```

### Code Scaffolding

Generate new components, services, pipes, and more:

```bash
ng generate component components/new-component
ng generate service services/new-service
ng generate pipe pipes/new-pipe
```

For a complete list of available schematics, run:
```bash
ng generate --help
```

### Building

Build the project for different environments:

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

### Unit Tests

Run unit tests with Karma:

```bash
ng test
```

### End-to-End Tests with Playwright

This project uses Playwright for end-to-end testing, providing reliable and fast testing across multiple browsers.

#### Test Structure

```
src/
├── pages/                      # Page Object Models
│   ├── BasePage.ts            # Base page with common methods
│   ├── CartPage.ts            # Shopping cart page actions
│   ├── CheckoutPage.ts        # Checkout process actions
│   ├── LoginPage.ts           # Login functionality
│   └── ProductsPage.ts        # Product listing and details
├── step-definitions/          # Cucumber step definitions
│   └── saucedemo.steps.ts     # Step definitions for all test scenarios
├── support/                   # Test support files
│   ├── custom-world.ts        # Custom World context for Cucumber
│   └── hooks.ts               # Before/After test hooks and setup
└── tests/
    ├── features/              # Cucumber feature files
    │   ├── saucedemo.feature         # Core test scenarios    
    │   ├── saucedemo-error.feature   # Error handling scenarios
    │   └── saucedemo-latency.feature # Performance testing scenarios
    └── mock-tests/           # Playwright mock tests
        └── book-mock.spec.ts # API mocking tests
```

#### Running Tests

Before running tests, install dependencies and Playwright browsers:

```bash
npm install
npx playwright install
```

Run all tests:
```bash
# Run all tests (both feature and mock tests)
npm run test:all

# Run all tests with debug logging
npm run test:debug
```

Run feature tests:
```bash
# Run feature tests with default browser
npm run test:features

# Run feature tests with specific tags
npm run test:features -- --tags "@smoke"

# Run feature tests for specific browsers
npm run test:chrome      # Chrome only
npm run test:firefox     # Firefox only
npm run test:webkit      # WebKit only

# Run feature tests in headed mode
npm run test:headed

# Run feature tests with UI mode
npm run test:ui
```

Run mock tests:
```bash
# Run API mock tests
npm run test:mock

# Run mock tests in debug mode
npm run test:mock:debug

# Run mock tests in UI mode
npm run test:mock:ui
```

#### Test Reports

Generate and view test reports:

```bash
# Generate all test reports
npm run report:generate

# Open HTML test report
npm run report:open

# Clean previous reports
npm run report:clean

# Generate and open reports in one command
npm run report:all
```

#### Additional Scripts
npm run check:types

# Lint check
npm run lint

# Clean test reports
npm run clean:reports
```

## 🔄 CI/CD Integration

The project includes GitHub Actions workflows for continuous integration and deployment:

### Automated Testing

- Runs on every push and pull request
- Executes all test suites across multiple browsers
- Generates and stores test reports as artifacts
- Validates code quality and TypeScript compilation

### Deployment

- Automated deployment to staging environment on merge to develop branch
- Production deployment triggered on release tags
- Environment-specific configuration management
- Build optimization for production

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.```bash
# TypeScript compilation check
npm run compile

# Kill port 4200 (runs automatically after mock tests)
npm run postmock
```

The HTML report includes:
- Test execution summary
- Test case details with steps
- Screenshots of failures
- Trace viewer for debugging
- Performance metrics

#### Configuration

Playwright configuration is in `playwright.config.ts`:
- Multiple browser support (Chromium, Firefox, WebKit)
- Parallel test execution
- Automatic screenshots on failure
- Trace recording for debugging
- Custom test timeout settings
- Global setup and teardown hooks

#### CI/CD Integration

The project uses GitHub Actions for continuous integration and delivery. The pipeline is configured in `.github/workflows/bookstore-ci.yml`.

##### Pipeline Structure

The CI/CD pipeline consists of three main jobs:

1. **Build and Test**
   - Runs on Ubuntu latest
   - Sets up Node.js 18.x environment
   - Installs dependencies and Playwright browsers
   - Builds the application
   - Runs unit tests
   - Uploads test coverage reports

2. **Playwright Tests**
   - Depends on successful build
   - Runs in parallel using matrix strategy (3 shards)
   - Executes both Playwright and Cucumber tests
   - Supports multiple operating systems (currently Ubuntu)
   - Uploads test results and reports

3. **Test Report Publication**
   - Combines all test results
   - Generates a unified test report
   - Publishes results using test-reporter
   - Uploads combined report as artifact

##### Trigger Events
The pipeline runs on:
- Push to main and develop branches
- Pull requests to main and develop branches

##### Test Artifacts
The following artifacts are generated and stored:
- Unit test results (coverage/)
- Playwright test results (playwright-report/)
- Test execution traces (test-results/)
- Combined test report (test-report/)

##### Dependencies Installation
```bash
npm install
npx playwright install
npx playwright install-deps
```

## 📚 Documentation

The application is built using Angular's best practices and follows a component-based architecture:

- Components are organized by feature
- Services handle data management and API calls
- Models define the structure of book and category data
- Routing enables smooth navigation between views

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Angular](https://angular.io/)
- [Angular Material](https://material.angular.io/)
- [RxJS](https://rxjs.dev/)

## Additional Resources

For more information on using Angular CLI, check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.