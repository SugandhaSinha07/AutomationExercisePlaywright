const { expect } = require('@playwright/test');

/**
 * The "Added!" popup shown after clicking "Add to cart".
 * It appears on both the Products page and the Product Details page,
 * so it is its own small component instead of being copied into both pages.
 */
class CartModal {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.modal = page.locator('#cartModal');
    this.title = this.modal.locator('.modal-title');
    this.viewCartLink = this.modal.locator('a[href="/view_cart"]');
    this.continueShoppingButton = this.modal.locator('.close-modal');
  }

  async verifyProductAdded() {
    await expect(this.modal).toBeVisible();
    await expect(this.title).toHaveText('Added!');
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await expect(this.modal).toBeHidden();
  }

  async viewCart() {
    await this.viewCartLink.click();
  }
}

module.exports = { CartModal };
