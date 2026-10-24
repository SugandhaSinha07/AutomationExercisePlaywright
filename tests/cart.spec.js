const { test, expect } = require('@playwright/test');
const { HomePage } = require('../pageObjects/HomePage');
const { ProductsPage } = require('../pageObjects/ProductsPage');
const { ProductDetailPage } = require('../pageObjects/ProductDetailPage');
const { CartPage } = require('../pageObjects/CartPage');

/** "Rs. 500" -> 500 */
function toNumber(priceText) {
  return Number(priceText.replace(/[^0-9]/g, ''));
}

test.describe('Cart', () => {
  let homePage;
  let productsPage;
  let cartPage;

  test.beforeEach(async ({ page }) => {
    // Block Google ads — they can cover buttons and make tests flaky
    await page.route(/googlesyndication|doubleclick|adservice|googleads/, (route) => route.abort());

    homePage = new HomePage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);

    await homePage.goto();
  });

  test('Test Case 12: Add Products in Cart', async () => {
    await homePage.clickProducts();
    await productsPage.verifyAllProductsPage();

    // Remember what the products page shows, to compare with the cart later
    const firstName = await productsPage.getProductName(0);
    const firstPrice = await productsPage.getProductPrice(0);
    const secondName = await productsPage.getProductName(1);
    const secondPrice = await productsPage.getProductPrice(1);

    await productsPage.addProductToCart(0);
    await productsPage.cartModal.continueShopping();
    await productsPage.addProductToCart(1);
    await productsPage.cartModal.viewCart();

    await cartPage.verifyCartPage();
    await expect(cartPage.cartRows).toHaveCount(2);

    // Product 1: price, quantity and total
    await expect(cartPage.getRow(firstName)).toBeVisible();
    expect(await cartPage.getPrice(firstName)).toBe(firstPrice);
    expect(await cartPage.getQuantity(firstName)).toBe('1');
    expect(await cartPage.getTotal(firstName)).toBe(firstPrice);

    // Product 2: price, quantity and total
    await expect(cartPage.getRow(secondName)).toBeVisible();
    expect(await cartPage.getPrice(secondName)).toBe(secondPrice);
    expect(await cartPage.getQuantity(secondName)).toBe('1');
    expect(await cartPage.getTotal(secondName)).toBe(secondPrice);
  });

  test('Test Case 13: Verify Product quantity in Cart', async ({ page }) => {
    const quantity = 4;
    const productDetailPage = new ProductDetailPage(page);

    await homePage.clickViewProduct(1);
    await productDetailPage.verifyProductDetailVisible();
    const productName = await productDetailPage.getProductName();

    await productDetailPage.setQuantity(quantity);
    await productDetailPage.addToCart();
    await productDetailPage.cartModal.viewCart();

    await cartPage.verifyCartPage();
    expect(await cartPage.getQuantity(productName)).toBe(String(quantity));

    // Total must be price × quantity
    const price = toNumber(await cartPage.getPrice(productName));
    const total = toNumber(await cartPage.getTotal(productName));
    expect(total).toBe(price * quantity);
  });

  test('Test Case 17: Remove Products From Cart', async () => {
    await homePage.clickProducts();
    await productsPage.verifyAllProductsPage();
    const productName = await productsPage.getProductName(0);

    await productsPage.addProductToCart(0);
    await productsPage.cartModal.viewCart();

    await cartPage.verifyCartPage();
    await expect(cartPage.getRow(productName)).toBeVisible();

    await cartPage.removeProduct(productName);
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});
