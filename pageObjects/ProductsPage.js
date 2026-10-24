const { expect } = require('@playwright/test');
const { CartModal } = require('./CartModal');

class ProductsPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.cartModal = new CartModal(page);

    this.pageHeading = page.locator('h2.title');
    this.productCards = page.locator('.single-products');
  }

  async verifyAllProductsPage() {
    await expect(this.page).toHaveURL(/\/products/);
    await expect(this.pageHeading).toHaveText('All Products');
    // "Add to cart" buttons only work after cart.js (end of the HTML) attaches its handlers
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Name shown on the product card at this position (0 = first product) */
  async getProductName(index) {
    return this.productCards.nth(index).locator('.productinfo p').innerText();
  }

  /** Price text shown on the product card, e.g. "Rs. 500" */
  async getProductPrice(index) {
    return this.productCards.nth(index).locator('.productinfo h2').innerText();
  }

  /** Hover over a product card and click the "Add to cart" button that appears */
  async addProductToCart(index) {
    const card = this.productCards.nth(index);
    await card.hover();

    // The button sends a request to /add_to_cart/<id>; wait for it so a server
    // error is reported as such, not just as "popup did not appear"
    const responsePromise = this.page.waitForResponse(/\/add_to_cart\//);
    await card.locator('.product-overlay .add-to-cart').click();
    const response = await responsePromise;
    expect(response.ok(), `add_to_cart returned HTTP ${response.status()}`).toBeTruthy();

    await this.cartModal.verifyProductAdded();
  }
}

module.exports = { ProductsPage };
