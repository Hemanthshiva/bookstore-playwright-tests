import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
    private readonly usernameInput = '#user-name';
    private readonly passwordInput = '#password';
    private readonly loginButton = '#login-button';
    private readonly errorMessage = '[data-test="error"]';

    constructor(page: Page) {
        super(page);
    }

    async navigate() {
        await this.page.goto('https://www.saucedemo.com/');
        // Wait for the login form to be visible
        await this.page.waitForSelector(this.loginButton, { state: 'visible' });
    }

    async enterUsername(username: string) {
        await this.page.waitForSelector(this.usernameInput);
        await this.page.fill(this.usernameInput, username);
    }

    async enterPassword(password: string) {
        await this.page.waitForSelector(this.passwordInput);
        await this.page.fill(this.passwordInput, password);
    }

    async clickLoginButton() {
        await this.page.waitForSelector(this.loginButton);
        await this.page.click(this.loginButton);
    }

    async login(username: string, password: string) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();
    }

    async isLoginButtonVisible() {
        return await this.isElementVisible(this.loginButton);
    }

    async getErrorMessage(): Promise<string> {
        await this.page.waitForSelector(this.errorMessage, { state: 'visible' });
        return await this.page.textContent(this.errorMessage) || '';
    }
}