const common = {
  requireModule: ["ts-node/register"],
  require: ["src/step-definitions/**/*.ts", "src/support/**/*.ts"],
  format: [
    "progress-bar",
    "html:test-results/cucumber-report.html",
    "json:test-results/cucumber-report.json",
  ],
  formatOptions: {
    snippetInterface: "async-await",
  },
  parallel: 1,
  testIdAttribute: "data-testid",
};

const performanceConfig = {
  ...common,
  timeout: 120000, // 2 minutes for performance_glitch_user
};

module.exports = {
  default: {
    ...common,
    paths: ["src/tests/features/**/*.feature"],
    worldParameters: {
      browser: "chromium",
      headless: true,
    },
  },
  chromium: {
    ...performanceConfig,
    paths: ["src/tests/features/**/*.feature"],
    worldParameters: {
      browser: "chromium",
      headless: true,
    },
  },
  firefox: {
    ...performanceConfig,
    paths: ["src/tests/features/**/*.feature"],
    worldParameters: {
      browser: "firefox",
      headless: true,
    },
  },
  webkit: {
    ...performanceConfig,
    paths: ["src/tests/features/**/*.feature"],
    worldParameters: {
      browser: "webkit",
      headless: true,
    },
  },
};
