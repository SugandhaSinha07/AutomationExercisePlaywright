const { expect } = require('@playwright/test');
const { CartModal } = require('./CartModal');

class ProductDetailPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartModal = new CartModal(page);

    this.productInfo = page.locator('.product-information');
    this.productName = this.productInfo.locator('h2');
    this.quantityInput = page.locator('#quantity');
    this.addToCartButton = page.locator('button.cart');
  }

  async verifyProductDetailVisible() {
    await expect(this.page).toHaveURL(/\/product_details\//);
    await expect(this.productInfo).toBeVisible();
    // "Add to cart" only works after cart.js (end of the HTML) attaches its handler
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getProductName() {
    return this.productName.innerText();
  }

  async setQuantity(quantity) {
    await this.quantityInput.fill(String(quantity));
  }

  async addToCart() {
    const responsePromise = this.page.waitForResponse(/\/add_to_cart\//);
    await this.addToCartButton.click();
    const response = await responsePromise;
    expect(response.ok(), `add_to_cart returned HTTP ${response.status()}`).toBeTruthy();

    await this.cartModal.verifyProductAdded();
  }
}

module.exports = { ProductDetailPage };
