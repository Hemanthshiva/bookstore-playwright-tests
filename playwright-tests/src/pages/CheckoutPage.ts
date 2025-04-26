import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
    private readonly firstNameInput = '#first-name';
    private readonly lastNameInput = '#last-name';
    private readonly zipCodeInput = '#postal-code';
    private readonly continueButton = '#continue';
    private readonly finishButton = '#finish';
    private readonly confirmationMessage = '.complete-header';

    constructor(page: Page) {
        super(page);
    }

    async fillShippingInfo(firstName: string, lastName: string, zipCode: string) {
        await this.page.fill(this.firstNameInput, firstName);
        await this.page.fill(this.lastNameInput, lastName);
        await this.page.fill(this.zipCodeInput, zipCode);
    }

    async clickContinue() {
        await this.page.click(this.continueButton);
    }

    async clickFinish() {
        await this.page.click(this.finishButton);
    }

    async getConfirmationMessage() {
        return await this.getText(this.confirmationMessage);
    }
}