import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Using require for dotenv in config file
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
export default defineConfig({
    globalTeardown: require.resolve('./global-teardown.ts'),
    testDir: './src/tests',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [
        ['list'],
        ['html', { open: 'never' }]
    ],
    use: {
        baseURL: 'https://www.saucedemo.com',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        testIdAttribute: 'data-testid',
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1280, height: 720 }
            },
        },
        // {
        //     name: 'firefox',
        //     use: {
        //         ...devices['Desktop Firefox'],
        //         viewport: { width: 1280, height: 720 }
        //     },
        // },
        // {
        //     name: 'webkit',
        //     use: {
        //         ...devices['Desktop Safari'],
        //         viewport: { width: 1280, height: 720 }
        //     },
        // }
    ],
    webServer: {
        // Use static HTTP server for both local and CI testing
        // (faster, no SSR issues, consistent behavior)
        command: 'npx http-server ../dist/bookstore/browser -p 4200 --gzip=false',
        port: 4200,
        reuseExistingServer: !process.env.CI,
        timeout: 30000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
