const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports', 'cucumber');
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Run cucumber with proper sharding and report configuration
    const reportPath = path.join(reportsDir, `cucumber-report-shard-${currentShard}.json`);
    
    try {
        execSync(
            `cucumber-js --config ./config/cucumber.js ` +
            `--format json:${reportPath} ` +
            `--format summary ` +
            `--parallel ${totalShards} ` +
            `--parallel-type features ` +
            `--retry 1 ` +
            `--tags "not @skip"`,
            { stdio: 'inherit' }
        );
    } catch (error) {
        console.error(`Error running cucumber tests for shard ${currentShard}:`, error);
        process.exit(1);
    }
}

runShardedFeatures();