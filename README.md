# Demoblaze QA Testing

This project is an automated testing framework for the [Demoblaze](https://www.demoblaze.com) demo e-commerce application, covering functional, validation, positive/negative, end-to-end, compatibility, API, stress and security testing, with a supplementary performance/load testing setup.

## Technologies used

- Playwright (TypeScript) — test automation
- Node.js
- dotenv — environment variable management for test credentials

## Initial setup

Clone the repository:
git clone https://github.com/Thinslices/qc-demoblaze-.git
cd qc-demoblaze-

Install dependencies:
npm install

Configure environment variables:
cp .env.example .env
Fill in `.env` with valid test credentials (see `.env.example` for the required keys, e.g. `VALID_USER`, `VALID_PASSWORD`).

Install Playwright browsers:
npx playwright install

## Running the tests

Run all tests:
npm test

Run in headed (visual) mode:
npm run test:headed

Run specific suites by tag:
npm run test:e2e # @e2e tagged tests (full user/purchase journeys)
npm run test:security # security-tests.spec.ts
npm run test:functional # functional-tests.spec.ts
...

Run a single project (browser) only, e.g. to skip WebKit issues:
npx playwright test --project=chromium

View the last HTML report:
npx playwright show-report

## Notes

- Demoblaze is a public demo site with known instability and latency; several tests include extended timeouts and retries to account for this rather than for defects in the test code itself.
- Some security tests (e.g. missing security headers, weak cookie flags) are expected to fail against demoblaze — these are documented findings, not broken tests.
