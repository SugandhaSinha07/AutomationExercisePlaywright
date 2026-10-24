const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pageObjects/HomePage');
const { LoginPage } = require('../pageObjects/LoginPage');
const { loginUser } = require('../utils/testData');

test.describe('User Login', () => {
  let homePage;
  let loginPage;

  test.beforeEach(async ({ page }) => {
    // Block Google ads — they can cover buttons and make tests flaky
    await page.route(/googlesyndication|doubleclick|adservice|googleads/, (route) => route.abort());

    homePage = new HomePage(page);
    loginPage = new LoginPage(page);

    await homePage.goto();
    await homePage.clickSignupLogin();
  });

  test('Test Case 2: Login with correct email and password', async () => {
    await loginPage.login(loginUser.email, loginUser.password);
    await homePage.verifyLoggedInAs(loginUser.name);

    // Logout instead of deleting — this fixed account is reused by every run
    await homePage.logout();
  });

  test('Test Case 3: Login with incorrect email and password', async () => {
    await loginPage.login(loginUser.email, 'WrongPassword@123');
    await expect(loginPage.loginErrorMessage).toBeVisible();
  });

  test('Test Case 4: Logout user', async ({ page }) => {
    await loginPage.login(loginUser.email, loginUser.password);
    await homePage.verifyLoggedInAs(loginUser.name);

    await homePage.logout();
    await expect(page).toHaveURL(/\/login/);
    await expect(loginPage.loginHeading).toBeVisible();
  });
});
