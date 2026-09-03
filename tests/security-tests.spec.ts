import { test, expect } from "@playwright/test";
import { addItemToCart, logIn, logInWithCredentials, signInWithCredentials } from "../helpers/helper-methods";

const payloadInjections = [
  { name: "SQL - OR bypass", value: "' OR '1'='1" },
  { name: "SQL - DROP TABLE", value: "'; DROP TABLE users; --" },
  { name: "XSS - script tag", value: "<script>alert('xss')</script>" },
  { name: "XSS - img onerror", value: "<img src=x onerror=alert(1)>" },
  { name: "NoSQL injection", value: '{"$ne": null}' },
];

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.demoblaze.com");
});

test("Check if password fields are masked", async ({ page }) => {
  const signInModal = page.locator("#signInModal");
  const logInModal = page.locator("#logInModal");
  await expect(logInModal).toBeHidden();
  await expect(signInModal).toBeHidden();

  await page.locator(".nav-link").getByText("Log in").click();
  await expect(logInModal).toBeVisible();
  await expect(page.locator("#loginpassword")).toHaveAttribute("type", "password");
  await logInModal.getByRole("button", { name: "Close", exact: true }).and(page.locator(".btn-secondary")).click();

  await page.locator(".nav-link").getByText("Sign up").click();
  await expect(signInModal).toBeVisible();
  await expect(page.locator("#sign-password")).toHaveAttribute("type", "password");
  await signInModal.getByRole("button", { name: "Close", exact: true }).and(page.locator(".btn-secondary")).click();
});

test("Check if authentication rejects invalid/empty credentials", async ({ page }) => {
  await signInWithCredentials(page, "", "");
});

test("Check if a user session is handled correctly after logout", async ({ page }) => {
  const welcomeUser = page.locator("#nameofuser");
  await logIn(page);

  const cookiesBefore = await page.context().cookies();
  console.log(cookiesBefore);
  const tokenBefore = cookiesBefore.find((c) => c.name === "tokenp_");
  expect(tokenBefore).toBeDefined();

  await page.locator(".nav-link").getByText("Log out").click();
  await expect(welcomeUser).toBeHidden();

  const cookiesAfter = await page.context().cookies();
  console.log(cookiesAfter);
  const tokenAfter = cookiesAfter.find((c) => c.name === "tokenp_");
  expect(tokenAfter).toBeUndefined();
});

test("Check if special characters are handled safely in username/password input", async ({ page }) => {
  await signInWithCredentials(page, `#$%^&*()${Date.now()}`, "#$%^&*()");
  await signInWithCredentials(page, "👾👾👾", "test");
});

test("Check if extremely long input is handled safely ", async ({ page }) => {
  const longInput = `${"x".repeat(10000)}${Date.now()}`;
  await signInWithCredentials(page, longInput, longInput);
});

test("Check if malformed input is handled safely ", async ({ page }) => {
  const malformedInput = "x\ny\nz\n\n\n";
  await signInWithCredentials(page, malformedInput, malformedInput);
});

test("Check if user data from one account can be accessed by another account", async ({ page }) => {
  await logIn(page);
  await page.locator(".list-group").getByText("Laptops").click();
  await addItemToCart(page, "2017 Dell 15.6 Inch");
  await page.locator(".nav-link").getByText("Cart").click();
  let productUser = await page.locator("#tbodyid tr td:nth-child(2)").first().textContent();
  expect(productUser?.trim()).toBe("2017 Dell 15.6 Inch");
  await page.locator(".nav-link").getByText("Log out").click();

  await logInWithCredentials(page, "test", "test");
  await page.locator(".nav-link").getByText("Cart").click();
  productUser = await page.locator("#tbodyid tr td:nth-child(2)").first().textContent();
  expect(productUser?.trim()).not.toBe("2017 Dell 15.6 Inch");
  await page.locator(".nav-link").getByText("Log out").click();
});

test(`Check if common injection-style inputs are handled safely`, async ({ page }) => {
  for (const { name, value } of payloadInjections) {
    let alert = false;

    await page.goto("https://www.demoblaze.com");
    await page.locator(".nav-link").getByText("Log in").click();
    await page.locator("#loginusername").fill(value);
    await page.locator("#loginpassword").fill(value);

    page.once("dialog", async (dialog) => {
      if (dialog.message().toLowerCase().includes("xss")) {
        alert = true;
      }
      await dialog.accept();
    });

    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.locator("#nameofuser")).toBeHidden();
    expect(alert).toBe(false);

    const bodyHtml = await page.locator("body").innerHTML();
    expect(bodyHtml).not.toContain("<script>alert('xss')</script>");
  }
});

test("Check if application errors expose sensitive technical information", async ({ page }) => {
  const suspiciousAnswers: string[] = [];

  page.on("response", async (response) => {
    if (response.status() >= 400) {
      const text = await response.text().catch(() => "");
      if (/stack trace|at\s+\w+\.\w+\(|SQLException|nodejs|\.php on line|Traceback/i.test(text)) {
        suspiciousAnswers.push(`${response.url()} - exposes technical informations`);
      }
    }
  });

  await page.goto("https://www.demoblaze.com/prod.html?idp=999999999");
  await page.goto("https://www.demoblaze.com/nonexistent-page-xyz.html");

  expect(suspiciousAnswers).toEqual([]);
});

test("Check if sensitive information is unnecessarily visible in requests/responses", async ({ page }) => {
  const foundIssues: string[] = [];

  page.on("request", (request) => {
    const url = request.url();
    const postData = request.postData() || "";

    if (/password/i.test(url) && request.method() === "GET") {
      foundIssues.push(`password found in URL: ${url}`);
    }

    if (postData.includes(process.env.VALID_PASSWORD || "___never_match___")) {
      foundIssues.push(`password sent in request body: ${request.url()}`);
    }
  });

  await logIn(page);

  expect(foundIssues).toEqual([]);
});

test("Check if security-related headers are present", async ({ page }) => {
  const response = await page.goto("https://www.demoblaze.com");
  const headers = response?.headers() ?? {};

  const missingHeaders = [
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "content-security-policy",
    "referrer-policy",
  ];

  const missing: string[] = [];
  for (const header of missingHeaders) {
    if (!headers[header]) {
      missing.push(header);
    }
  }

  console.log("Missing headers:", missing);
});
