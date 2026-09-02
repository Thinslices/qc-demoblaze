import { test, expect } from "@playwright/test";
import {
  addItemToCart,
  orderCart,
  logIn,
  logInWithCredentials,
  signInWithCredentials,
  sendMessage,
} from "../helpers/helper-methods";

test("Complete purchase flow", async ({ page }) => {
  await logIn(page);
  await page.locator(".list-group").getByText("Phones").click();
  await addItemToCart(page, "Sony xperia z5");
  await page.locator(".list-group").getByText("Laptops").click();
  await addItemToCart(page, "2017 Dell 15.6 Inch");
  await page.locator(".list-group").getByText("Monitors").click();
  await addItemToCart(page, "ASUS Full HD");

  await page.locator(".nav-link").getByText("Cart").click();
  const total = page.locator("#totalp");
  await expect(total).toHaveText(/^\d+$/);

  await page.getByRole("button", { name: "Place Order" }).click();

  await orderCart(page, "Cosmin", "Romania", "Iasi", "1234", "Sept", "2026");
});

test("Complete user flow", async ({ page }) => {
  const welcomeUser = page.locator("#nameofuser");
  const username = `TeSt${Date.now()}`;
  await signInWithCredentials(page, username, "test");
  await logInWithCredentials(page, username, "test");

  await page.locator(".nav-link").getByText("Log out").click();
  await expect(welcomeUser.getByText("Welcome usernameValid")).toBeHidden();

  await logInWithCredentials(page, "Teeest1", "tEEEst1");
  await sendMessage(page, "email@email.com", "Cosmin", "HELLO WORLD!");
});
