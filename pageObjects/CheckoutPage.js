const { expect } = require('@playwright/test');

class CheckoutPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.addressDetailsHeading = page.getByRole('heading', { name: 'Address Details' });
    this.reviewOrderHeading = page.getByRole('heading', { name: 'Review Your Order' });
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.commentTextarea = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.locator('a[href="/payment"]');
  }

  async verifyCheckoutPage() {
    await expect(this.page).toHaveURL(/\/checkout/);
    await expect(this.addressDetailsHeading).toBeVisible();
    await expect(this.reviewOrderHeading).toBeVisible();
  }

  /** Delivery and billing address must both show the details used at registration */
  async verifyAddress(user) {
    for (const address of [this.deliveryAddress, this.billingAddress]) {
      await expect(address).toContainText(`${user.title}. ${user.firstName} ${user.lastName}`);
      await expect(address).toContainText(user.company);
      await expect(address).toContainText(user.address);
      await expect(address).toContainText(user.address2);
      await expect(address).toContainText(`${user.city} ${user.state} ${user.zipcode}`);
      await expect(address).toContainText(user.country);
      await expect(address).toContainText(user.mobile);
    }
  }

  async placeOrder(comment) {
    await this.commentTextarea.fill(comment);
    await this.placeOrderButton.click();
  }
}

module.exports = { CheckoutPage };
