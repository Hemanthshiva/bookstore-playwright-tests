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
        // Uses the Angular dev server locally, but a fast static server in CI
        command: process.env.CI
            ? 'npx http-server ../dist/bookstore/browser -p 4200'
            : 'npm run start',
        port: 4200,
        reuseExistingServer: !process.env.CI,
    },
});
