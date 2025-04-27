import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
    private readonly addToCartBtn = '[data-test^="add-to-cart"]';
    private readonly cartIcon = '.shopping_cart_link';
    private readonly cartBadge = '.shopping_cart_badge';
    private readonly productsList = '.inventory_item';
    private readonly sortDropdown = '.select_container';
    private readonly sortDropdownContainer = '[data-test="product-sort-container"]';
    private readonly productNames = '.inventory_item_name';
    private readonly productPrices = '.inventory_item_price';
    private readonly inventoryList = '.inventory_list';

    private lastPopupMessage: string = '';

    constructor(page: Page) {
        super(page);
    }

    async waitForPageLoad(isPerformanceUser = false) {
        const timeout = isPerformanceUser ? 120000 : 60000;
        console.log(`Waiting for page load with timeout: ${timeout}ms`);

        // Wait for the inventory container first
        await this.page.waitForSelector(this.inventoryList, { state: 'visible', timeout });
        console.log('Inventory list found');

        // Then check for other elements without failing if they're not found
        try {
            await this.page.waitForSelector(this.productsList, { timeout });
            console.log('Product list found');
        } catch (e) {
            console.log('Products list not found, continuing...');
        }

        if (isPerformanceUser) {
            console.log('Performance user detected, adding extra wait');
            await this.page.waitForTimeout(5000);
        }
    }

    async isOnProductsPage(): Promise<boolean> {
        await this.waitForPageLoad();
        return await this.page.isVisible(this.inventoryList);
    }

    async addFirstItemToCart(): Promise<void> {
        await this.waitForPageLoad();
        await this.page.click(this.addToCartBtn);
    }

    async clickCartIcon(): Promise<void> {
        await this.page.click(this.cartIcon);
    }

    async getCartBadgeCount(): Promise<string> {
        return await this.page.textContent(this.cartBadge) || '';
    }

    async isCartBadgeVisible(): Promise<boolean> {
        return await this.isElementVisible(this.cartBadge);
    }

    async isSortDropdownVisible(isPerformanceUser = false): Promise<boolean> {
        try {
            const timeout = isPerformanceUser ? 60000 : 5000;
            console.log(`Checking sort dropdown visibility with timeout: ${timeout}ms`);
            await this.page.waitForSelector(this.sortDropdown, { state: 'visible', timeout });
            const isVisible = await this.page.isVisible(this.sortDropdown);
            console.log(`Sort dropdown visibility: ${isVisible}`);
            return isVisible;
        } catch (e) {
            console.log('Error checking sort dropdown visibility:', e);
            return false;
        }
    }

    async sortProductsBy(sortOption: string, isPerformanceUser = false): Promise<void> {
        await this.waitForPageLoad();

        const optionValueMap: { [key: string]: string } = {
            'Name (A to Z)': 'az',
            'Name (Z to A)': 'za',
            'Price (low to high)': 'lohi',
            'Price (high to low)': 'hilo'
        };

        // Get the value from the map and validate
        const value = optionValueMap[sortOption];
        if (!value) {
            throw new Error(`Invalid sort option: ${sortOption}`);
        }

        this.page.once('dialog', async (dialog) => {
            this.lastPopupMessage = dialog.message();
            await dialog.accept();
        });

        // Perform the sort actions
        await this.page.locator(this.sortDropdown).click();
        await this.page.locator(this.sortDropdownContainer).selectOption(value);

        try {
            // Small wait to allow for any dialog to appear
            await this.page.waitForTimeout(100);

            if (isPerformanceUser) {
                await this.page.waitForTimeout(5000);
                await this.waitForSortOptionToBeSelected(sortOption);
            }
        } catch (error) {
            console.error('Sort operation failed:', error);
            throw error;
        }
    }


    async waitForSortOptionToBeSelected(sortOption: string): Promise<void> {
        await expect(async () => {
            const currentSortOption = await this.getCurrentSortOption();
            console.log('Current sort option:', currentSortOption);
            return currentSortOption === sortOption;
        }).toPass();
    }

    private async getCurrentSortOption(): Promise<string> {
        return await this.page.getByTestId('active-option').innerText();
    }

    getLastPopupMessage(): string {
        return this.lastPopupMessage;
    }

    async getProductNames(): Promise<string[]> {
        await this.waitForPageLoad();
        return await this.page.$$eval(this.productNames,
            elements => elements.map(el => el.textContent || '')
        );
    }

    async verifyAlphabeticalSort(ascending: boolean, isPerformanceUser = false): Promise<boolean> {
        const names = await this.getProductNames();
        const sortedNames = [...names].sort((a, b) => {
            return ascending ? a.localeCompare(b) : b.localeCompare(a);
        });
        return JSON.stringify(names) === JSON.stringify(sortedNames);
    }

    async verifyPriceSort(ascending: boolean, isPerformanceUser = false): Promise<boolean> {
        const prices = await this.page.$$eval(this.productPrices,
            elements => elements.map(el => {
                const price = el.textContent?.replace('$', '') || '0';
                return parseFloat(price);
            })
        );
        const sortedPrices = [...prices].sort((a, b) => {
            return ascending ? a - b : b - a;
        });
        return JSON.stringify(prices) === JSON.stringify(sortedPrices);
    }

    async addAllItemsToCart(): Promise<void> {
        await this.waitForPageLoad();
        const buttons = await this.page.locator(this.addToCartBtn).all();
        for (let i = buttons.length - 1; i >= 0; i--) {
            await buttons[i].click();
        }
    }

    async getAddToCartButtonCount(): Promise<number> {
        const buttons = this.page.locator(this.addToCartBtn);
        return await buttons.count();
    }

    async isInventoryListVisible(isPerformanceUser = false): Promise<boolean> {
        const timeout = isPerformanceUser ? 60000 : 5000;
        try {
            await this.page.waitForSelector(this.inventoryList, { timeout });
            return await this.page.isVisible(this.inventoryList);
        } catch (e) {
            console.log('Error checking inventory list visibility:', e);
            return false;
        }
    }

    async getAddedToCartCount(): Promise<number> {
        const cartBadgeText = await this.getCartBadgeCount();
        return cartBadgeText ? parseInt(cartBadgeText) : 0;
    }

    async clickSortDropdown(): Promise<void> {
        try {
            await this.waitForPageLoad();
            await this.page.click(this.sortDropdown);
        } catch (e) {
            console.log('Error clicking sort dropdown:', e);
        }
    }

    async getSortOptions(): Promise<string[]> {
        await this.waitForPageLoad();
        const options = await this.page.$$eval(`${this.sortDropdown} option`,
            elements => elements.map(el => el.textContent?.trim() || '')
        );
        return options;
    }

    async canViewProductDetails(isPerformanceUser = false): Promise<boolean> {
        try {
            const timeout = isPerformanceUser ? 60000 : 5000;
            console.log(`Checking product details with timeout: ${timeout}ms`);

            // Wait for and verify that at least one product link exists
            await this.page.waitForSelector(this.productNames, { state: 'visible', timeout });
            const productLinks = await this.page.$$(this.productNames);

            if (productLinks.length > 0) {
                // Try clicking the first product
                await productLinks[0].click();

                // Verify we can see product details by checking for back button
                const backBtn = await this.page.waitForSelector('[data-test="back-to-products"]',
                    { state: 'visible', timeout: 5000 });

                if (backBtn) {
                    // Go back to products page
                    await backBtn.click();
                    await this.waitForPageLoad(isPerformanceUser);
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.log('Error checking product details:', e);
            return false;
        }
    }

    async verifyPopUpErrorMessage(expectedMessage: string): Promise<boolean> {
        return this.lastPopupMessage === expectedMessage;
    }
}