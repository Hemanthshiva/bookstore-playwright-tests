const report = require("multiple-cucumber-html-reporter");
const fs = require("fs");
const path = require("path");
const open = require("open");

// Ensure the reports directory exists
const reportsDir = path.join(__dirname, "..", "reports", "cucumber");
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Define report path
const reportPath = path.join(__dirname, "..", "reports", "cucumber-html-report");

// Generate the report
report.generate({
  jsonDir: path.join(__dirname, "..", "reports", "cucumber"),
  reportPath: reportPath,
  metadata: {
    browser: {
      name: process.env.BROWSER || "chrome",
    },
    device: "Local test machine",
    platform: {
      name: process.platform,
    },
  },
  customData: {
    title: "Test Execution Info",
    data: [
      { label: "Project", value: "Book Store Testing" },
      { label: "Release", value: "1.0.0" },
      { label: "Execution Start Time", value: new Date().toISOString() },
    ],
  },
  disableLog: true,
  pageTitle: "Cucumber Test Report",
  reportName: "Cucumber Test Report",
  displayDuration: true,
});

// Wait a short moment for the report to be generated
setTimeout(() => {
  const reportFile = path.join(reportPath, "index.html");
  // Check if the report file exists
  if (fs.existsSync(reportFile)) {
    console.log("Opening test report...");
    open(reportFile);
  } else {
    console.error("Report file not found:", reportFile);
  }
}, 1000);