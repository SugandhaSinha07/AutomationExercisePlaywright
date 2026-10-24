const { test } = require('@playwright/test');
const { HomePage } = require('../pageObjects/HomePage');
const { LoginPage } = require('../pageObjects/LoginPage');
const { SignupPage } = require('../pageObjects/SignupPage');
const { generateUser } = require('../utils/testData');

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    // Block Google ads — they can cover buttons and make tests flaky
    await page.route(/googlesyndication|doubleclick|adservice|googleads/, (route) => route.abort());
  });

  test('Test Case 1: Register User', async ({ page }) => {
    const user = generateUser();
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const signupPage = new SignupPage(page);

    await homePage.goto();
    await homePage.clickSignupLogin();
    await loginPage.signup(user.name, user.email);

    await signupPage.verifyAccountInfoVisible();
    await signupPage.fillAccountDetails(user);
    await signupPage.fillAddressDetails(user);
    await signupPage.clickCreateAccount();
    await signupPage.verifyAccountCreated();

    await homePage.verifyLoggedInAs(user.name);
    await homePage.deleteAccount();
  });
});
