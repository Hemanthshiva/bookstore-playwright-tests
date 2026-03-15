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
        command: 'cd .. && npx ng serve --host 127.0.0.1 --port 4200 --configuration development --no-ssr',
        url: 'http://127.0.0.1:4200',
        timeout: 180000,
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
