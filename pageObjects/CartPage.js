const { expect } = require('@playwright/test');

class CartPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.cartRows = page.locator('#cart_info_table tbody tr');
    this.emptyCartMessage = page.locator('#empty_cart');
    this.proceedToCheckoutButton = page.locator('#do_action .check_out');

    // Popup shown when a guest (not logged in) clicks "Proceed To Checkout"
    this.checkoutModal = page.locator('#checkoutModal');
    this.registerLoginLink = this.checkoutModal.locator('a[href="/login"]');
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }

  /** As a guest: Proceed To Checkout -> popup -> "Register / Login" */
  async proceedToCheckoutAsGuest() {
    await this.proceedToCheckoutButton.click();
    await expect(this.checkoutModal).toBeVisible();
    await this.registerLoginLink.click();
  }

  async verifyCartPage() {
    await expect(this.page).toHaveURL(/\/view_cart/);
    // The delete (X) buttons only work after cart.js attaches its handlers
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** The table row for one product, found by its name */
  getRow(productName) {
    return this.cartRows.filter({ hasText: productName });
  }

  async getPrice(productName) {
    return this.getRow(productName).locator('.cart_price p').innerText();
  }

  async getQuantity(productName) {
    return this.getRow(productName).locator('.cart_quantity button').innerText();
  }

  async getTotal(productName) {
    return this.getRow(productName).locator('.cart_total_price').innerText();
  }

  /** Sum of every row's total, as a number ("Rs. 500" + "Rs. 400" -> 900) */
  async getCartTotal() {
    const totals = await this.cartRows.locator('.cart_total_price').allInnerTexts();
    return totals.reduce((sum, text) => sum + Number(text.replace(/[^0-9]/g, '')), 0);
  }

  async removeProduct(productName) {
    await this.getRow(productName).locator('.cart_quantity_delete').click();
    await expect(this.getRow(productName)).toHaveCount(0);
  }
}

module.exports = { CartPage };
