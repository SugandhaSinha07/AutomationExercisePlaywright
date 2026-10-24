const { expect } = require('@playwright/test');

class PaymentPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.nameOnCardInput = page.locator('[data-qa="name-on-card"]');
    this.cardNumberInput = page.locator('[data-qa="card-number"]');
    this.cvcInput = page.locator('[data-qa="cvc"]');
    this.expiryMonthInput = page.locator('[data-qa="expiry-month"]');
    this.expiryYearInput = page.locator('[data-qa="expiry-year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');

    // "Order Placed!" page
    this.orderPlacedHeading = page.locator('[data-qa="order-placed"]');
    this.orderConfirmedMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceButton = page.locator('a[href^="/download_invoice/"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async payAndConfirmOrder(card) {
    await expect(this.page).toHaveURL(/\/payment/);
    await this.nameOnCardInput.fill(card.nameOnCard);
    await this.cardNumberInput.fill(card.number);
    await this.cvcInput.fill(card.cvc);
    await this.expiryMonthInput.fill(card.expiryMonth);
    await this.expiryYearInput.fill(card.expiryYear);
    await this.payButton.click();
  }

  async verifyOrderPlaced() {
    await expect(this.orderPlacedHeading).toHaveText('Order Placed!');
    await expect(this.orderConfirmedMessage).toBeVisible();
  }

  /** Clicks "Download Invoice" and returns Playwright's Download object */
  async downloadInvoice() {
    // Start waiting for the download before clicking, so it can't be missed
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadInvoiceButton.click();
    return downloadPromise;
  }

  async clickContinue() {
    await this.continueButton.click();
  }
}

module.exports = { PaymentPage };
