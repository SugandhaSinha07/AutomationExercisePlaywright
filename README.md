# Automation Exercise – Playwright Test Framework

[![Playwright Tests](https://github.com/SugandhaSinha07/AutomationExercisePlaywright/actions/workflows/playwright.yml/badge.svg)](https://github.com/SugandhaSinha07/AutomationExercisePlaywright/actions/workflows/playwright.yml)

End-to-end UI test automation for [automationexercise.com](https://automationexercise.com), a practice e-commerce site, built with **Playwright** and **JavaScript** using the **Page Object Model**. Tests run on Chromium, Firefox and WebKit, locally and on every push through **GitHub Actions**.

## Tech stack

| | |
|---|---|
| Test framework | [Playwright Test](https://playwright.dev) 1.64 |
| Language | JavaScript (Node.js, CommonJS) |
| Design pattern | Page Object Model + component objects |
| Browsers | Chromium, Firefox, WebKit |
| Reporting | Playwright HTML report, screenshots, videos, traces |
| CI | GitHub Actions |

## Test coverage

Test case numbers match the site's own [Test Cases](https://automationexercise.com/test_cases) page.

| Spec | Test case | What is verified |
|---|---|---|
| `register.spec.js` | TC1 – Register User | Full signup form, "Account Created!", logged in, account deleted |
| `login.spec.js` | TC2 – Login with correct credentials | "Logged in as &lt;name&gt;" |
| | TC3 – Login with incorrect credentials | Error message is shown |
| | TC4 – Logout | Returns to the login page |
| `cart.spec.js` | TC12 – Add Products in Cart | 2 products, prices match the products page, quantity and total |
| | TC13 – Verify Product quantity in Cart | Quantity 4, total = price × quantity |
| | TC17 – Remove Products From Cart | Row removed, "Cart is empty!" |
| `checkout.spec.js` | TC14 – Place Order: Register while Checkout | Guest checkout popup, register, address check, payment, "Order Placed!" |
| | TC15 – Place Order: Register before Checkout | Register, cart, address check, payment, "Order Placed!" |

## Project structure

```
├── .github/workflows/
│   └── playwright.yml        # CI: runs all tests on push / pull request
├── pageObjects/              # One class per page: locators + actions
│   ├── HomePage.js           # header navigation, logged-in check, logout, delete account
│   ├── LoginPage.js          # "Login to your account" + "New User Signup!"
│   ├── SignupPage.js         # account information + address form
│   ├── ProductsPage.js       # product cards, add to cart
│   ├── ProductDetailPage.js  # quantity + add to cart
│   ├── CartModal.js          # "Added!" popup (shared component)
│   ├── CartPage.js           # cart rows, remove, proceed to checkout
│   ├── CheckoutPage.js       # address details, review order, place order
│   └── PaymentPage.js        # card details, order confirmation
├── tests/                    # One spec file per feature
├── utils/
│   └── testData.js           # unique user generator, login account, payment card
└── playwright.config.js      # baseURL, browsers, timeouts, retries, reporters
```

## Getting started

**Prerequisites:** Node.js 18 or newer, Git.

```bash
git clone https://github.com/SugandhaSinha07/AutomationExercisePlaywright.git
cd AutomationExercisePlaywright
npm install
npx playwright install
```

The login tests use a fixed account defined in `utils/testData.js` (`loginUser`). If those tests fail with "Your email or password is incorrect!", the account has been removed from the public site — register it again with the same details.

## Running tests

| Command | What it does |
|---|---|
| `npm test` | All tests, all browsers |
| `npm run test:chromium` | All tests, Chromium only |
| `npm run test:headed` | Chromium with the browser visible |
| `npm run test:ui` | Interactive UI mode |
| `npm run report` | Open the last HTML report |
| `npx playwright test tests/cart.spec.js` | One spec file |
| `npx playwright test -g "Test Case 13"` | One test by name |
| `npx playwright test --debug` | Step through with the Playwright Inspector |

Set `TEST_PASSWORD` to override the password used for newly registered users:

```powershell
$env:TEST_PASSWORD="MyPass@1"; npm test
```

## Design decisions

- **Page Object Model.** Tests contain no locators and read like the manual test steps. The "Added!" popup appears on two pages, so it is a separate component (`CartModal`) included by both instead of being duplicated.
- **Stable locators.** `data-qa` attributes and IDs first, then text or role-based locators. Lists and tables are handled by scoping, e.g. `cartRows.filter({ hasText: name }).locator('.cart_price p')`.
- **Independent tests.** Registration and checkout create a new user per test (`Date.now()` + a random UUID part, so parallel workers never collide) and delete it at the end. Each test gets a fresh browser context, so carts never leak between tests.
- **Fresh users for checkout.** A logged-in user's cart is stored on the server, so a shared account would mix up carts when browsers run in parallel. The fixed login account is only used for read-only login tests.
- **Blocking ads.** The site loads Google ads that can cover buttons. Each spec aborts requests to ad domains with `page.route()`.
- **Waiting for JavaScript handlers.** Some buttons (Add to cart, Delete) get their click handlers from a script at the end of the HTML. Page objects wait for `domcontentloaded` before clicking, and check the `/add_to_cart` network response so a server error is reported clearly.
- **Handling an unstable site.** The practice site sometimes times out or returns Cloudflare 520 errors. The config uses 2 workers locally, 1 retry locally and 2 on CI. A test that passes on retry is reported as *flaky*, so instability stays visible.
- **Debugging evidence.** Screenshots and videos are kept only for failed tests, and traces on the first retry.

## Continuous integration

`.github/workflows/playwright.yml` runs on every push and pull request to `main`:

1. Check out the code and set up Node.js
2. `npm ci` – install the exact versions from `package-lock.json`
3. `npx playwright install --with-deps` – install browsers and system libraries
4. `npx playwright test` – run the suite headless
5. Upload the HTML report as a build artifact (kept for 30 days, also when tests fail)

To see a report from CI: open the **Actions** tab → select a run → download **playwright-report** → open `index.html`.
