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

// Function to validate and fix JSON files
function validateAndFixJsonFiles(jsonDir) {
  const files = fs.readdirSync(jsonDir).filter(file => file.endsWith('.json'));
  let validFiles = [];

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Try to parse the JSON to validate it
      JSON.parse(content);
      validFiles.push(filePath);
    } catch (error) {
      console.warn(`Warning: Invalid JSON in file ${file}, skipping...`);
      console.error(error.message);
    }
  }

  if (validFiles.length === 0) {
    console.error('No valid JSON files found!');
    process.exit(1);
  }

  return validFiles;
}

// Validate JSON files before generating report
console.log('Validating JSON files...');
const jsonDir = path.join(__dirname, "..", "reports", "cucumber");
validateAndFixJsonFiles(jsonDir);

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