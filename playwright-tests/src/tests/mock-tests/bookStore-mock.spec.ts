import { test, expect } from '@playwright/test';

test.describe('BookStore API Mock Tests', () => {
    const API_ENDPOINT = 'https://bookcart.azurewebsites.net/api/book';

    test('should display mocked list of books', async ({ page }) => {
        const mockBooks = [
            {
                "bookId": 1,
                "title": "Test Book 1",
                "author": "Test Author 1",
                "category": "Fiction",
                "price": 25.99,
                "coverFileName": "cff3d5ee-71f3-43d8-8625-33abcd48659eHP6.jpg"
            },
            {
                "bookId": 2,
                "title": "Test Book 2",
                "author": "Test Author 2",
                "category": "Non-Fiction",
                "price": 19.99,
                "coverFileName": "cff3d5ee-71f3-43d8-8625-33abcd48659eHP6.jpg"
            }
        ];

        await page.route(API_ENDPOINT, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockBooks)
            });
        });

        await page.goto('http://localhost:4200/books');
        await page.waitForLoadState('networkidle');

        // Verify book titles
        const bookCards = await page.locator('[data-testid^="book-card"]').all();
        expect(bookCards).toHaveLength(2);

        for (const [index, card] of bookCards.entries()) {
            // Verify book title
            const titleElement = card.getByTestId('book-title');
            await expect(titleElement).toBeVisible();
            await expect(titleElement).toHaveText(mockBooks[index].title);

            // Verify authors
            const authorElement = card.getByTestId('book-author');
            await expect(authorElement).toBeVisible();
            await expect(authorElement).toHaveText(mockBooks[index].author);

            // Verify prices
            const priceElement = card.getByTestId('book-price');
            await expect(priceElement).toBeVisible();
            await expect(priceElement).toContainText(mockBooks[index].price.toString());

            // Verify categories
            const categoryElement = card.getByTestId('book-category');
            await expect(categoryElement).toBeVisible();
            await expect(categoryElement).toContainText(mockBooks[index].category);
        }
    });

    test('should handle API error gracefully', async ({ page }) => {
        await page.route(API_ENDPOINT, async route => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({
                    message: 'Internal Server Error'
                })
            });
        });

        await page.goto('http://localhost:4200/books');
        await page.waitForLoadState('networkidle');

        // Verify error state
        const errorMessage = page.getByTestId('error-message');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Failed to load books. Please try again later.');

        // Verify no books are displayed
        const bookCards = await page.locator('[data-testid^="book-card"]').all();
        expect(bookCards).toHaveLength(0);
    });

    test('should handle empty book list', async ({ page }) => {
        await page.route(API_ENDPOINT, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });

        await page.goto('http://localhost:4200/books');
        await page.waitForLoadState('networkidle');

        // Verify empty state message
        const emptyMessage = page.getByTestId('no-results');
        await expect(emptyMessage).toBeVisible();
        await expect(emptyMessage).toContainText('No books found.');

        // Verify no books are displayed
        const bookCards = await page.locator('[data-testid^="book-card"]').all();
        expect(bookCards).toHaveLength(0);
    });

    test('should handle book search', async ({ page }) => {
        const searchResults = [
            {
                "bookId": 1,
                "title": "Search Result Book",
                "author": "Search Author",
                "category": "History",
                "price": 29.99,
                "coverFileName": "cff3d5ee-71f3-43d8-8625-33abcd48659eHP6.jpg"
            }
        ];

        await page.route(API_ENDPOINT, async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(searchResults)
            });
        });

        await page.goto('http://localhost:4200/books');
        await page.waitForLoadState('networkidle');

        // Enter search term
        const searchInput = page.getByTestId('search-input');
        await searchInput.fill(searchResults[0].title);
        await page.keyboard.press('Enter');

        // Verify search results
        const bookCards = await page.locator('[data-testid^="book-card"]').all();
        expect(bookCards).toHaveLength(1);

        const card = bookCards[0];
        // Verify book title
        const titleElement = card.getByTestId('book-title');
        await expect(titleElement).toBeVisible();
        await expect(titleElement).toHaveText(searchResults[0].title);

        // Verify author
        const authorElement = card.getByTestId('book-author');
        await expect(authorElement).toBeVisible();
        await expect(authorElement).toHaveText(searchResults[0].author);

        // Verify price
        const priceElement = card.getByTestId('book-price');
        await expect(priceElement).toBeVisible();
        await expect(priceElement).toContainText(searchResults[0].price.toString());

        // Verify category
        const categoryElement = card.getByTestId('book-category');
        await expect(categoryElement).toBeVisible();
        await expect(categoryElement).toContainText(searchResults[0].category);
    });

    test('should handle slow network response', async ({ page }) => {
        const delayedBook = [
            {
                "bookId": 1,
                "title": "Delayed Book",
                "author": "Delayed Author",
                "category": "Fiction",
                "price": 15.99,
                "coverFileName": "cff3d5ee-71f3-43d8-8625-33abcd48659eHP6.jpg"
            }
        ];

        await page.route(API_ENDPOINT, async route => {
            await new Promise(resolve => setTimeout(resolve, 3000));
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(delayedBook)
            });
        });

        await page.goto('http://localhost:4200/books');

        // Verify loading state
        const loadingElement = page.getByTestId('loading-spinner');
        await expect(loadingElement).toBeVisible();

        // Wait for data to load
        await page.waitForLoadState('networkidle');

        // Verify loading state is gone
        await expect(loadingElement).not.toBeVisible();

        // Verify book data appears after delay
        const bookCards = await page.locator('[data-testid^="book-card"]').all();
        expect(bookCards).toHaveLength(1);

        const card = bookCards[0];
        // Verify book title
        const titleElement = card.getByTestId('book-title');
        await expect(titleElement).toBeVisible();
        await expect(titleElement).toHaveText(delayedBook[0].title);

        // Verify author
        const authorElement = card.getByTestId('book-author');
        await expect(authorElement).toBeVisible();
        await expect(authorElement).toHaveText(delayedBook[0].author);

        // Verify price
        const priceElement = card.getByTestId('book-price');
        await expect(priceElement).toBeVisible();
        await expect(priceElement).toContainText(delayedBook[0].price.toString());

        // Verify category
        const categoryElement = card.getByTestId('book-category');
        await expect(categoryElement).toBeVisible();
        await expect(categoryElement).toContainText(delayedBook[0].category);
    });

    test('should handle pagination correctly', async ({ page }) => {
        // Mock API response with 12 books
        const mockBooks = require('../../../test-data/12-books-data.json');

        await page.route(API_ENDPOINT, route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockBooks)
        }));

        await page.goto('http://localhost:4200/books');

        // Verify first page
        const pagination = page.getByTestId('paginator');
        const bookCards = page.locator('[data-testid^="book-card"]');
        const categories = page.locator('[data-testid^="category-item"]');

        await expect(pagination).toBeVisible();
        await expect(bookCards).toHaveCount(10);
        await expect(categories).toHaveCount(5);

        // Verify second page
        const nextButton = pagination.locator('[aria-label="Next page"]');
        await nextButton.click();

        await expect(nextButton).toBeDisabled();
        await expect(bookCards).toHaveCount(2);
    });

    test('should display books without pagination for small dataset', async ({ page }) => {
        const mockBooks = require('../../../test-data/5-books-data.json');

        // Mock API response
        await page.route(API_ENDPOINT, route => route.fulfill({
            status: 200,
            body: JSON.stringify(mockBooks)
        }));

        await page.goto('http://localhost:4200/books');

        // Verify page content
        await expect(page.getByTestId('paginator').locator('[aria-label="Next page"]')).toBeDisabled();
        await expect(page.locator('[data-testid^="book-card"]')).toHaveCount(6);
        await expect(page.locator('[data-testid^="category-item"]')).toHaveCount(4);
    });
});