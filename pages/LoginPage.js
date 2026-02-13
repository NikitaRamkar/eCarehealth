import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;

    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[type="password"]';
    this.loginButton = 'button:has-text("Let\'s get Started")';
  }

  async goto() {
    try {
      await this.page.goto(
        'https://stage_catholichealth.uat.provider.ecarehealth.com/auth/login',
        { 
          waitUntil: 'domcontentloaded',
          timeout: 60000 
        }
      );
    } catch (error) {
      console.error('Error navigating to login page:', error.message);
      throw error;
    }
  }

  async login() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector(this.usernameInput, { timeout: 60000 });

    await this.page.fill(this.usernameInput, 'saurabh.kale+heather@medarch.com');
    await this.page.fill(this.passwordInput, 'Pass@1234');
    await this.page.click(this.loginButton);
  }

  async verifyLoginSuccess() {
    await this.page.waitForURL(/dashboard/, { timeout: 15000 });
  }
}

