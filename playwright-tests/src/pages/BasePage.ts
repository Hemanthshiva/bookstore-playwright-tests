import { Page } from '@playwright/test';

export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForElement(selector: string) {
        await this.page.waitForSelector(selector);
    }

    async getText(selector: string) {
        return await this.page.textContent(selector);
    }

    async isElementVisible(selector: string) {
        return await this.page.isVisible(selector);
    }
}