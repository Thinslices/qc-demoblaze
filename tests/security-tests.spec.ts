import { test, expect } from "@playwright/test";
import { addItemToCart, logIn, logInWithCredentials, signInWithCredentials } from "../helpers/helper-methods";

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
