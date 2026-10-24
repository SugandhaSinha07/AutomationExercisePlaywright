const { expect } = require('@playwright/test');

class HomePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Header / navigation
    this.logo = page.locator('img[alt="Website for automation practice"]');
    this.productsLink = page.locator('a[href="/products"]');
    this.cartLink = page.locator('#header a[href="/view_cart"]');
    this.signupLoginLink = page.locator('a[href="/login"]');
    this.loggedInAs = page.locator('a:has-text("Logged in as")');
    this.deleteAccountLink = page.locator('a[href="/delete_account"]');
    this.logoutLink = page.locator('a[href="/logout"]');

    // "Account Deleted" page
    this.accountDeletedHeading = page.locator('[data-qa="account-deleted"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async goto() {
    // Don't wait for every ad/image to finish loading — the HTML being ready is enough
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveTitle('Automation Exercise');
    await expect(this.logo).toBeVisible();
  }

  async clickProducts() {
    await this.productsLink.click();
  }

  async clickCart() {
    await this.cartLink.click();
  }

  /** Clicks "View Product" under a product on the home page */
  async clickViewProduct(productId) {
    await this.page.locator(`a[href="/product_details/${productId}"]`).first().click();
  }

  async clickSignupLogin() {
    await this.signupLoginLink.click();
  }

  async verifyLoggedInAs(name) {
    await expect(this.loggedInAs).toBeVisible();
    await expect(this.loggedInAs).toContainText(`Logged in as ${name}`);
  }

  async logout() {
    await this.logoutLink.click();
  }

  async deleteAccount() {
    await this.deleteAccountLink.click();
    await expect(this.accountDeletedHeading).toHaveText('Account Deleted!');
    await this.continueButton.click();
  }
}

module.exports = { HomePage };
