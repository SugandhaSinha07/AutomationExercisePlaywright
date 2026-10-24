const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pageObjects/HomePage');
const { LoginPage } = require('../pageObjects/LoginPage');
const { SignupPage } = require('../pageObjects/SignupPage');
const { ProductsPage } = require('../pageObjects/ProductsPage');
const { CartPage } = require('../pageObjects/CartPage');
const { CheckoutPage } = require('../pageObjects/CheckoutPage');
const { PaymentPage } = require('../pageObjects/PaymentPage');
const { generateUser, paymentCard } = require('../utils/testData');

// A fresh user per test: a logged-in user's cart is saved on the server,
// so a shared account would mix up carts when browsers run in parallel.
test.describe('Checkout', () => {
  let user;
  let homePage;
  let loginPage;
  let signupPage;
  let productsPage;
  let cartPage;
  let checkoutPage;
  let paymentPage;

  test.beforeEach(async ({ page }) => {
    // Block Google ads — they can cover buttons and make tests flaky
    await page.route(/googlesyndication|doubleclick|adservice|googleads/, (route) => route.abort());

    user = generateUser();
    homePage = new HomePage(page);
    loginPage = new LoginPage(page);
    signupPage = new SignupPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    paymentPage = new PaymentPage(page);

    await homePage.goto();
  });

  /** Signup form -> account details -> Create Account -> Continue -> "Logged in as" */
  async function registerUser() {
    await loginPage.signup(user.name, user.email);
    await signupPage.verifyAccountInfoVisible();
    await signupPage.fillAccountDetails(user);
    await signupPage.fillAddressDetails(user);
    await signupPage.clickCreateAccount();
    await signupPage.verifyAccountCreated();
    await homePage.verifyLoggedInAs(user.name);
  }

  /** Products page -> add the first two products -> open the cart */
  async function addTwoProductsToCart() {
    await homePage.clickProducts();
    await productsPage.verifyAllProductsPage();
    await productsPage.addProductToCart(0);
    await productsPage.cartModal.continueShopping();
    await productsPage.addProductToCart(1);
    await productsPage.cartModal.viewCart();
    await cartPage.verifyCartPage();
  }

  /** Checkout page -> verify address -> Place Order -> pay -> "Order Placed!" */
  async function placeOrderAndPay() {
    await checkoutPage.verifyCheckoutPage();
    await checkoutPage.verifyAddress(user);
    await checkoutPage.placeOrder('Please deliver between 9 AM and 6 PM.');

    await paymentPage.payAndConfirmOrder(paymentCard);
    await paymentPage.verifyOrderPlaced();
  }

  /** As a guest: Proceed To Checkout -> popup -> register -> back to cart -> Proceed To Checkout */
  async function registerWhileCheckout() {
    await cartPage.proceedToCheckoutAsGuest();
    await registerUser();

    // The cart is kept after registering — go back and check out
    await homePage.clickCart();
    await cartPage.verifyCartPage();
    await cartPage.proceedToCheckout();
  }

  test('Test Case 14: Place Order: Register while Checkout', async () => {
    await addTwoProductsToCart();
    await registerWhileCheckout();

    await placeOrderAndPay();
    await homePage.deleteAccount();
  });

  test('Test Case 15: Place Order: Register before Checkout', async () => {
    await homePage.clickSignupLogin();
    await registerUser();

    await addTwoProductsToCart();
    await cartPage.proceedToCheckout();

    await placeOrderAndPay();
    await homePage.deleteAccount();
  });

  test('Test Case 16: Place Order: Login before Checkout', async () => {
    // Precondition: an existing account. Registered fresh (then logged out) instead of
    // using the shared login account, whose server-side cart other browsers would also use.
    await homePage.clickSignupLogin();
    await registerUser();
    await homePage.logout();

    // Test steps
    await homePage.clickSignupLogin();
    await loginPage.login(user.email, user.password);
    await homePage.verifyLoggedInAs(user.name);

    await addTwoProductsToCart();
    await cartPage.proceedToCheckout();

    await placeOrderAndPay();
    await homePage.deleteAccount();
  });

  test('Test Case 24: Download Invoice after purchase order', async ({}, testInfo) => {
    await addTwoProductsToCart();
    const cartTotal = await cartPage.getCartTotal();
    await registerWhileCheckout();

    await placeOrderAndPay();

    // Download the invoice and check the file
    const download = await paymentPage.downloadInvoice();
    expect(download.suggestedFilename()).toBe('invoice.txt');

    const filePath = testInfo.outputPath(download.suggestedFilename());
    await download.saveAs(filePath);
    const invoiceText = fs.readFileSync(filePath, 'utf8');
    expect(invoiceText).toContain(`Hi ${user.firstName} ${user.lastName}`);
    expect(invoiceText).toContain(`Your total purchase amount is ${cartTotal}`);

    await paymentPage.clickContinue();
    await homePage.deleteAccount();
  });
});
