import { test, expect } from "@playwright/test";
import { logIn, signInWithCredentials, signInWithGeneratedCredentials } from "../helpers/helper-methods";

test("Check if a new user can successfully create an account with valid data", async ({ page }) => {
  await signInWithCredentials(page, "UsErNaMe721233432", "PaRoLa1233432");
  await signInWithGeneratedCredentials(page);
});

test("Check if a registered user can successfully login with valid credentials and log out", async ({ page }) => {
  const welcomeUser = page.locator("#nameofuser");

  await logIn(page);
  await page.locator(".nav-link").getByText("Log out").click();
  await expect(welcomeUser.getByText("Welcome usernameValid")).toBeHidden();
});

test("Check if a user can successfully add one/multiple product(s)t to the cart + corect cart total", async ({
  page,
}) => {
  await page.goto("https://www.demoblaze.com");
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
