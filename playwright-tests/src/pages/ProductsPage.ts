import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
    private readonly addToCartBtn = '[data-test^="add-to-cart"]';
    private readonly cartIcon = '.shopping_cart_link';
    private readonly cartBadge = '.shopping_cart_badge';
    private readonly productsTitle = '.title';
    private readonly productsList = '.inventory_item';
    private readonly sortDropdown = '.select_container';
    private readonly productNames = '.inventory_item_name';
    private readonly productPrices = '.inventory_item_price';
    private readonly inventoryList = '.inventory_list';

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

    async waitForSortOption(option: string, maxRetries = 3): Promise<boolean> {
        let retries = 0;
        while (retries < maxRetries) {
            try {
                // Wait for dropdown to be visible
                await this.page.waitForSelector(this.sortDropdown, { state: 'visible', timeout: 20000 });

                // Get all available options
                const options = await this.page.$$eval(this.sortDropdown + ' option',
                    elements => elements.map(el => el.textContent));

                // Check if our option exists
                if (options.includes(option)) {
                    return true;
                }
            } catch (e) {
                console.log(`Retry ${retries + 1} for sort option: ${option}`);
            }
            retries++;
            if (retries < maxRetries) {
                await this.page.waitForTimeout(5000); // Wait 5 seconds before retry
            }
        }
        return false;
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

    private async waitForSortToComplete(prevNames: string[], timeout = 30000): Promise<boolean> {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const currentNames = await this.getProductNames();
            if (JSON.stringify(currentNames) !== JSON.stringify(prevNames)) {
                return true;
            }
            await this.page.waitForTimeout(1000);
        }
        return false;
    }

    private async debugArrays(actual: any[], expected: any[], label: string) {
        console.log(`\n${label} Debug:`);
        console.log('Actual:', actual);
        console.log('Expected:', expected);
        console.log('Arrays match:', JSON.stringify(actual) === JSON.stringify(expected));
    }

    private async getCurrentSortOption(): Promise<string> {
        return await this.page.getByTestId('active-option').innerText();
    }

    private async forceRefresh(): Promise<void> {
        const currentUrl = this.page.url();
        await this.page.goto(currentUrl);
        await this.waitForPageLoad();
    }

    async sortProductsBy(sortOption: string, isPerformanceUser = false): Promise<void> {
        await this.waitForPageLoad();

        // Get initial product names for comparison
        const initialNames = await this.getProductNames();
        console.log('Initial names:', initialNames);

        // Wait for sort option with retries
        const sortAvailable = await this.waitForSortOption(sortOption);
        if (!sortAvailable) {
            console.log('Sort dropdown not available or option not found');
            return;
        }

        // Attempt to select the option
        try {
            // Map the display text to the actual option value
            const optionValueMap: { [key: string]: string } = {
                'Name (A to Z)': 'az',
                'Name (Z to A)': 'za',
                'Price (low to high)': 'lohi',
                'Price (high to low)': 'hilo'
            };

            const optionValue = optionValueMap[sortOption];
            await this.page.selectOption(this.sortDropdown, { value: optionValue });
            await this.waitForSortOptionToBeSelected(sortOption);

            // For performance_glitch_user, use multiple approaches to ensure sort takes effect
            if (isPerformanceUser) {
                // First wait for any immediate changes
                await this.page.waitForTimeout(5000);

                // Try clicking the dropdown again to ensure it's properly engaged
                await this.page.click(this.sortDropdown);
                await this.page.waitForTimeout(1000);

                // Select the option again
                await this.page.selectOption(this.sortDropdown, { value: optionValue });
                await this.page.waitForTimeout(5000);

                // Force a refresh and wait for load
                await this.forceRefresh();
                await this.page.waitForTimeout(3000);
            } else {
                // For other users, just wait for potential animations
                await this.page.waitForTimeout(2000);
            }

            const finalNames = await this.getProductNames();
            console.log('Final names after sort:', finalNames);
        } catch (e) {
            console.log('Error during sort operation:', e);
        }
    }


    private async waitForSortOptionToBeSelected(sortOption: string): Promise<void> {
        await expect(async () => {
            const currentSortOption = await this.getCurrentSortOption();
            console.log('Current sort option:', currentSortOption);
            return currentSortOption === sortOption;
        }).toPass();
    }


    private async verifyOrder<T>(items: T[], expectedItems: T[]): Promise<boolean> {
        if (items.length !== expectedItems.length) return false;
        for (let i = 0; i < items.length; i++) {
            if (items[i] !== expectedItems[i]) return false;
        }
        return true;
    }

    async getProductNames(): Promise<string[]> {
        await this.waitForPageLoad();
        return await this.page.$$eval(this.productNames,
            elements => elements.map(el => el.textContent || ''));
    }

    async getProductPrices(): Promise<number[]> {
        await this.waitForPageLoad();
        const prices = await this.page.$$eval(this.productPrices,
            elements => elements.map(el => el.textContent || ''));
        return prices.map(price => parseFloat(price.replace('$', '')));
    }

    async verifyAlphabeticalSort(ascending: boolean, isPerformanceUser = false): Promise<boolean> {
        // For performance_glitch_user, add extra initial wait
        if (isPerformanceUser) {
            await this.page.waitForTimeout(5000);
        }

        for (let i = 0; i < (isPerformanceUser ? 5 : 3); i++) {
            const names = await this.getProductNames();
            const sorted = [...names].sort((a, b) =>
                ascending ? a.localeCompare(b) : b.localeCompare(a));

            this.debugArrays(names, sorted, `Alphabetical sort ${ascending ? 'ascending' : 'descending'}`);

            if (await this.verifyOrder(names, sorted)) {
                return true;
            }

            if (isPerformanceUser && i < 4) {
                // For performance_glitch_user, try refreshing between attempts
                await this.forceRefresh();
                await this.page.waitForTimeout(3000);
            } else if (i < 2) {
                await this.page.waitForTimeout(2000);
            }
        }
        return false;
    }

    async verifyPriceSort(ascending: boolean, isPerformanceUser = false): Promise<boolean> {
        // For performance_glitch_user, add extra initial wait
        if (isPerformanceUser) {
            await this.page.waitForTimeout(5000);
        }

        for (let i = 0; i < (isPerformanceUser ? 5 : 3); i++) {
            const prices = await this.getProductPrices();
            const sorted = [...prices].sort((a, b) =>
                ascending ? a - b : b - a);

            this.debugArrays(prices, sorted, `Price sort ${ascending ? 'ascending' : 'descending'}`);

            if (await this.verifyOrder(prices, sorted)) {
                return true;
            }

            if (isPerformanceUser && i < 4) {
                // For performance_glitch_user, try refreshing between attempts
                await this.forceRefresh();
                await this.page.waitForTimeout(3000);
            } else if (i < 2) {
                await this.page.waitForTimeout(2000);
            }
        }
        return false;
    }

    async clickSortDropdown(): Promise<void> {
        await this.waitForPageLoad();
        try {
            await this.page.click(this.sortDropdown);
        } catch (e) {
            console.log('Error clicking sort dropdown:', e);
        }
    }

    async getSortOptions(): Promise<string[]> {
        await this.waitForPageLoad();
        try {
            return await this.page.$$eval(`${this.sortDropdown} option`,
                elements => elements.map(el => el.textContent || ''));
        } catch (e) {
            console.log('Error getting sort options:', e);
            return [];
        }
    }

    async isInventoryListVisible(isPerformanceUser = false): Promise<boolean> {
        try {
            const timeout = isPerformanceUser ? 60000 : 5000;
            console.log(`Checking inventory list visibility with timeout: ${timeout}ms`);
            await this.page.waitForSelector(this.inventoryList, { state: 'visible', timeout });
            const isVisible = await this.page.isVisible(this.inventoryList);
            console.log(`Inventory list visibility: ${isVisible}`);
            return isVisible;
        } catch (e) {
            console.log('Error checking inventory list visibility:', e);
            return false;
        }
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
}