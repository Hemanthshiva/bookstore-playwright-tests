const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

function runShardedFeatures() {
    const args = process.argv.slice(2);
    const shardArg = args.find(arg => arg.startsWith('--shard='));
    const totalShardsArg = args.find(arg => arg.startsWith('--total-shards='));
    
    if (!shardArg || !totalShardsArg) {
        console.error('Please provide both --shard and --total-shards arguments');
        process.exit(1);
    }

    const currentShard = parseInt(shardArg.split('=')[1]);
    const totalShards = parseInt(totalShardsArg.split('=')[1]);

    // Get all feature files
    const featureFiles = glob.sync('src/tests/features/**/*.feature');
    
    // Calculate which features to run in this shard
    const featuresPerShard = Math.ceil(featureFiles.length / totalShards);
    const startIndex = (currentShard - 1) * featuresPerShard;
    const endIndex = Math.min(startIndex + featuresPerShard, featureFiles.length);
    const shardFeatures = featureFiles.slice(startIndex, endIndex);

    if (shardFeatures.length === 0) {
        console.log(`No features to run in shard ${currentShard}`);
        return;
    }

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports', 'cucumber');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Run cucumber with proper configuration
    const reportPath = path.join(reportsDir, `cucumber-report-shard-${currentShard}.json`);
    
    try {
        const command = [
            'cucumber-js',
            '--config ./config/cucumber.js',
            `--format json:${reportPath}`,
            '--format summary',
            '--retry 1',
            '--tags "not @skip"',
            ...shardFeatures // Add the feature files for this shard
        ].join(' ');

        console.log(`Running cucumber tests for shard ${currentShard} with command:\n${command}`);
        execSync(command, { stdio: 'inherit' });
    } catch (error) {
        console.error(`Error running cucumber tests for shard ${currentShard}:`, error);
        process.exit(1);
    }
}

runShardedFeatures();