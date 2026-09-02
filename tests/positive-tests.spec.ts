import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.demoblaze.com");
});

test("Check if a new user can successfully create an account with valid data", async ({ page }) => {
  const signInModal = page.locator("#signInModal");
  await expect(signInModal).toBeHidden();

  await page.locator(".nav-link").getByText("Sign up").click();
  await expect(signInModal).toBeVisible();

  await page.locator(".form-group").locator("#sign-username").fill(`${process.env.NEW_USER}${Date.now()}`);
  await page.locator(".form-group").locator("#sign-password").fill(`${process.env.NEW_PASSWORD}${Date.now()}`);

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Sign up" }).click();

  await expect.poll(() => dialogMessage).not.toBe("");
  expect(dialogMessage).toBe("Sign up successful.");

  await expect(signInModal).toBeHidden();
});

test("Check if a registered user can successfully login with valid credentials and log out", async ({ page }) => {
  const logInModal = page.locator("#logInModal");
  await expect(logInModal).toBeHidden();
  const welcomeUser = page.locator("#nameofuser");

  await page.locator(".nav-link").getByText("Log in").click();
  await expect(logInModal).toBeVisible();

  await page.locator(".form-group").locator("#loginusername").fill(`${process.env.VALID_USER}`);
  await page.locator(".form-group").locator("#loginpassword").fill(`${process.env.VALID_PASSWORD}`);

  await page.getByRole("button", { name: "Log in" }).click();
  await expect(logInModal).toBeHidden();
  await expect(welcomeUser.getByText("Welcome usernameValid")).toBeVisible();

  await page.locator(".nav-link").getByText("Log out").click();
  await expect(welcomeUser.getByText("Welcome usernameValid")).toBeHidden();
});

test("Check if a user can successfully add one/multiple product(s)t to the cart + corect cart total", async ({
  page,
}) => {
  const orderModal = page.locator("#orderModalLabel");
  await expect(orderModal).toBeHidden();
  const confirmationModal = page.locator(".sweet-overlay");
  await expect(confirmationModal).toBeHidden();

  await page.locator(".card-title a").first().click();
  const valText = await page.locator("h3.price-container").textContent();
  const val = Number(valText?.replace(/\D/g, ""));
  const count = 4;
  for (let i = 0; i < 4; i++) await page.getByRole("link", { name: "Add to cart" }).click();

  await page.locator(".nav-link").getByText("Cart").click();
  await expect(page.locator("#tbodyid tr")).toHaveCount(count);
  const total = page.locator("#totalp");
  const totalVal = count * val;
  await expect(total).toHaveText(totalVal.toString());
});
