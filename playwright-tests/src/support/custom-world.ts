import { World, IWorldOptions } from '@cucumber/cucumber';
import { Page, Browser, BrowserContext } from '@playwright/test';

export interface ICustomWorld extends World {
    page?: Page;
    browser?: Browser;
    context?: BrowserContext;
    parameters: { browser?: string } & Record<string, any>;
}

export class CustomWorld extends World implements ICustomWorld {
    page?: Page;
    browser?: Browser;
    context?: BrowserContext;
    
    constructor(options: IWorldOptions) {
        super(options);
    }
}