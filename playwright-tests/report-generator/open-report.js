const open = require('open');
const path = require('path');
const fs = require('fs');

const reportPath = path.join(__dirname, '..', 'reports', 'cucumber-html-report', 'index.html');

// Check if the report exists
if (fs.existsSync(reportPath)) {
    console.log('Opening test report...');
    open(reportPath).catch(err => {
        console.error('Error opening report:', err);
    });
} else {
    console.error('Report not found at:', reportPath);
    console.log('Please ensure you have run the tests and generated the report first.');
}