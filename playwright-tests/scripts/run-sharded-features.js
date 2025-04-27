const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get shard information from environment variables
const shardIndex = parseInt(process.env.SHARD || '1');
const totalShards = parseInt(process.env.SHARD_COUNT || '1');

// Get all feature files
const featuresDir = path.join(__dirname, '../src/tests/features');
const featureFiles = fs.readdirSync(featuresDir)
    .filter(file => file.endsWith('.feature'))
    .sort();

// Calculate which features to run in this shard
const featuresPerShard = Math.ceil(featureFiles.length / totalShards);
const startIndex = (shardIndex - 1) * featuresPerShard;
const endIndex = Math.min(startIndex + featuresPerShard, featureFiles.length);

// Get this shard's feature files
const shardFeatures = featureFiles.slice(startIndex, endIndex);

console.log(`Shard ${shardIndex}/${totalShards} running ${shardFeatures.length} features`);

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../reports/cucumber');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Run each feature file
shardFeatures.forEach((feature, index) => {
    const featurePath = path.join(featuresDir, feature);
    console.log(`Running feature ${index + 1}/${shardFeatures.length}: ${feature}`);
    
    try {
        execSync(`cucumber-js --config ./config/cucumber.js --format json:reports/cucumber/cucumber-report-${shardIndex}-${index}.json --format summary "${featurePath}"`, {
            stdio: 'inherit'
        });
    } catch (error) {
        console.error(`Error running feature ${feature}:`, error);
    }
});