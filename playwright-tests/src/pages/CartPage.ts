import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
    // Using data-test attributes where available for better stability
    private readonly cartItem = '.cart_item';
    private readonly checkoutButton = '[data-test="checkout"]';
    private readonly cartList = '.cart_list';
    private readonly cartItemName = '.inventory_item_name';
    private readonly cartItemPrice = '.inventory_item_price';
    private readonly continueShoppingButton = '[data-test="continue-shopping"]';

    constructor(page: Page) {
        super(page);
    }

    async waitForPageLoad() {
        await this.waitForElement(this.cartList);
    }

    async hasItemInCart() {
        return await this.isElementVisible(this.cartItem);
    }

    /**
     * Removes an item from the cart by its name
     * @param itemName The name of the item to remove
     */
    async removeItem(itemName?: string) {
        if (itemName) {
            // Find the cart item containing the specified name and click its remove button
            const itemSelector = `${this.cartItem} .inventory_item_name:has-text("${itemName}") ~ .item_pricebar .btn_secondary`;
            await this.page.click(itemSelector);
        } else {
            // If no name specified, remove the first item in the cart
            await this.page.click(`${this.cartItem} .btn_secondary`);
        }
    }

    /**
     * Removes a specific item by its data-test attribute
     * @param dataTestId The data-test ID of the remove button (e.g., "remove-sauce-labs-backpack")
     */
    async removeItemByTestId(dataTestId: string) {
        await this.page.click(`[data-test="${dataTestId}"]`);
    }

    async proceedToCheckout() {
        await this.page.click(this.checkoutButton);
    }

    async continueShopping() {
        await this.page.click(this.continueShoppingButton);
    }

    async isCartEmpty() {
        return !(await this.isElementVisible(this.cartItem));
    }

    async getItemName(index = 0): Promise<string> {
        const names = await this.page.$$(this.cartItemName);
        if (names && names.length > index) {
            return await names[index].textContent() || '';
        }
        return '';
    }

    async getItemPrice(index = 0): Promise<string> {
        const prices = await this.page.$$(this.cartItemPrice);
        if (prices && prices.length > index) {
            return await prices[index].textContent() || '';
        }
        return '';
    }

    async getCartItemCount(): Promise<number> {
        const items = await this.page.$$(this.cartItem);
        return items ? items.length : 0;
    }

}