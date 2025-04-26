import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { Browser, chromium, firefox, webkit } from '@playwright/test';
import { ICustomWorld } from './custom-world';

let browser: Browser;
let currentBrowserType: string = 'chromium';

BeforeAll(async function () {
    // Launch chromium by default
    browser = await chromium.launch({ headless: true });
});

Before(async function (this: ICustomWorld, { pickle }) {
    // Change browser if needed based on parameters
    const requestedBrowserType = this.parameters?.browser || 'chromium';

    // Switch browser if a different type is requested
    if (requestedBrowserType !== currentBrowserType) {
        await browser?.close();

        switch (requestedBrowserType) {
            case 'firefox':
                browser = await firefox.launch({ headless: false });
                break;
            case 'webkit':
                browser = await webkit.launch({ headless: false });
                break;
            default:
                browser = await chromium.launch({ headless: false });
        }
        currentBrowserType = requestedBrowserType;
    }

    try {
        // Create a fresh context for each scenario
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });

        // Create a new page for the scenario
        this.page = await context.newPage();

        // Store the context in the world object so we can close it later
        this.context = context;

        // Set higher timeout for performance_glitch_user
        if (pickle.name.includes('performance_glitch_user')) {
            this.page.setDefaultTimeout(60000); // 1 minute timeout
            this.page.setDefaultNavigationTimeout(60000);
        }
    } catch (error) {
        console.error('Failed to create context or page:', error);
        throw error;
    }
});

After(async function (this: ICustomWorld) {
    try {
        // Close both page and context after each scenario
        await this.page?.close();
        await this.context?.close();
    } catch (error) {
        console.error('Error in After hook:', error);
    }
});

AfterAll(async function () {
    try {
        // Close browser after all tests
        await browser?.close();
    } catch (error) {
        console.error('Error in AfterAll hook:', error);
    }
});