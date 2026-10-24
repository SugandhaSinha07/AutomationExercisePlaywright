const { randomUUID } = require('crypto');

/**
 * Generates fresh user data for registration.
 * Email is made unique with Date.now() + a random part, so parallel workers
 * calling this in the same millisecond still get different emails.
 */
function generateUser() {
  const uniqueId = `${Date.now()}${randomUUID().slice(0, 6)}`;

  return {
    // Signup section ("New User Signup!")
    name: `TestUser${uniqueId}`,
    email: `testuser_${uniqueId}@test.com`,

    // Account information
    title: 'Mr',                 // 'Mr' or 'Mrs'
    password: process.env.TEST_PASSWORD || 'Test@12345',
    birthDay: '10',
    birthMonth: 'May',           // dropdown label
    birthYear: '1995',

    // Address information
    firstName: 'Test',
    lastName: 'User',
    company: 'QA Company',
    address: '221B Baker Street',
    address2: 'Near Central Park',
    country: 'India',            // must match a dropdown option on the site
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    zipcode: '226001',
    mobile: '9876543210',
  };
}

/**
 * Fixed account used by the login tests. It must already exist on the site,
 * so tests must never delete it.
 */
const loginUser = {
  name: 'PlaywrightLearner',
  email: 'pw_learner_2026@test.com',
  password: 'Test@12345',
};

/** Dummy card details — the site accepts any values, no real payment happens */
const paymentCard = {
  nameOnCard: 'Test User',
  number: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2030',
};

module.exports = { generateUser, loginUser, paymentCard };
