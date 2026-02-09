import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;

    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[type="password"]';
    this.loginButton = 'button:has-text("Let\'s get Started")';
  }

  async goto() {
    await this.page.goto(
      'https://qa_ambrosia.qa.provider.ecarehealth.com/auth/login'
    );
  }

  async login() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector(this.usernameInput, { timeout: 60000 });

    await this.page.fill(this.usernameInput, 'nikita.ramkar+nikita@medarch.com');
    await this.page.fill(this.passwordInput, 'Admin@123');
    await this.page.click(this.loginButton);
  }

  async verifyLoginSuccess() {
    await this.page.waitForURL(/dashboard/, { timeout: 15000 });
  }
}

