const { expect } = require('@playwright/test');

class SignupPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Account information
    this.accountInfoHeading = page.getByText('Enter Account Information');
    this.titleMr = page.locator('#id_gender1');
    this.titleMrs = page.locator('#id_gender2');
    this.passwordInput = page.locator('[data-qa="password"]');
    this.daysDropdown = page.locator('[data-qa="days"]');
    this.monthsDropdown = page.locator('[data-qa="months"]');
    this.yearsDropdown = page.locator('[data-qa="years"]');
    this.newsletterCheckbox = page.locator('#newsletter');
    this.offersCheckbox = page.locator('#optin');

    // Address information
    this.firstNameInput = page.locator('[data-qa="first_name"]');
    this.lastNameInput = page.locator('[data-qa="last_name"]');
    this.companyInput = page.locator('[data-qa="company"]');
    this.addressInput = page.locator('[data-qa="address"]');
    this.address2Input = page.locator('[data-qa="address2"]');
    this.countryDropdown = page.locator('[data-qa="country"]');
    this.stateInput = page.locator('[data-qa="state"]');
    this.cityInput = page.locator('[data-qa="city"]');
    this.zipcodeInput = page.locator('[data-qa="zipcode"]');
    this.mobileInput = page.locator('[data-qa="mobile_number"]');
    this.createAccountButton = page.locator('[data-qa="create-account"]');

    // "Account Created" page
    this.accountCreatedHeading = page.locator('[data-qa="account-created"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async verifyAccountInfoVisible() {
    await expect(this.accountInfoHeading).toBeVisible();
  }

  async fillAccountDetails(user) {
    if (user.title === 'Mrs') {
      await this.titleMrs.check();
    } else {
      await this.titleMr.check();
    }
    await this.passwordInput.fill(user.password);
    await this.daysDropdown.selectOption(user.birthDay);
    await this.monthsDropdown.selectOption(user.birthMonth);
    await this.yearsDropdown.selectOption(user.birthYear);
    await this.newsletterCheckbox.check();
    await this.offersCheckbox.check();
  }

  async fillAddressDetails(user) {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.companyInput.fill(user.company);
    await this.addressInput.fill(user.address);
    await this.address2Input.fill(user.address2);
    await this.countryDropdown.selectOption(user.country);
    await this.stateInput.fill(user.state);
    await this.cityInput.fill(user.city);
    await this.zipcodeInput.fill(user.zipcode);
    await this.mobileInput.fill(user.mobile);
  }

  async clickCreateAccount() {
    await this.createAccountButton.click();
  }

  async verifyAccountCreated() {
    await expect(this.accountCreatedHeading).toHaveText('Account Created!');
    await this.continueButton.click();
  }
}

module.exports = { SignupPage };
