import { test, expect } from "@playwright/test";
import { addFirstItemToCart, orderCart, sendMessage } from "../helpers/helper-methods";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.demoblaze.com");
});

test("@functional Check if a user is able to open the homepage ", async ({ page }) => {
  await page.locator(".nav-link").getByText("Home").click();

  await expect(page).toHaveURL("https://www.demoblaze.com/index.html");
  await expect(page.locator(".card-title")).not.toHaveCount(0);
});

test("@functional Check if a user is able to open the Phones category", async ({ page }) => {
  await page.locator(".list-group").getByText("Phones").click();

  await expect(page.locator(".card-title").first()).toContainText("Samsung");
});

test("@functional Check if a user is able to open the Laptops category", async ({ page }) => {
  await page.locator(".list-group").getByText("Laptops").click();

  await expect(page.locator(".card-title").first()).toContainText("Sony");
});

test("@functional Check if a user is able to open the Monitors category", async ({ page }) => {
  await page.locator(".list-group").getByText("Monitors").click();

  await expect(page.locator(".card-title").first()).toContainText("Apple");
});

test("@functional Check if a user is able to open the cart ", async ({ page }) => {
  await page.locator(".nav-link").getByText("Cart").click();

  await expect(page).toHaveURL("https://www.demoblaze.com/cart.html");
});

test("@functional Check if the About us section can be opened and closed", async ({ page }) => {
  const aboutModal = page.locator("#videoModal");
  await expect(aboutModal).toBeHidden();

  await page.locator(".nav-link").getByText("About us").click();
  await expect(aboutModal).toBeVisible();
  await expect(aboutModal.getByRole("heading", { name: "About Us" })).toBeVisible();

  await aboutModal.getByRole("button", { name: "Close", exact: true }).and(page.locator(".btn-secondary")).click();
  await expect(aboutModal).toBeHidden();
});

test("@functional Check if the cart total is updated after adding or removing products", async ({ page }) => {
  await addFirstItemToCart(page);

  await page.locator(".nav-link").getByText("Cart").click();
  const total = page.locator("#totalp");
  await expect(total).not.toHaveText("", { timeout: 10000 });

  await expect(total).toHaveText(/^\d+$/);

  const totalDupaAdaugare = Number(await total.textContent());
  expect(totalDupaAdaugare).toBeGreaterThan(0);

  await page.locator("#tbodyid tr").first().getByRole("link", { name: "Delete" }).click();
  await expect(page.locator("#tbodyid tr")).toHaveCount(0, { timeout: 10000 });
  await expect(total).toHaveText("", { timeout: 10000 });
});

test("@functional Check if a user is able to place an order with valid data and receive a confirmation message", async ({
  page,
}) => {
  const orderModal = page.locator("#orderModalLabel");
  await expect(orderModal).toBeHidden();
  const confirmationModal = page.locator(".sweet-overlay");
  await expect(confirmationModal).toBeHidden();

  await page.locator(".card-title a").first().click();
  await page.getByRole("link", { name: "Add to cart" }).click();

  await page.locator(".nav-link").getByText("Cart").click();
  const total = page.locator("#totalp");
  await expect(total).not.toHaveText("", { timeout: 10000 });

  await expect(total).toHaveText(/^\d+$/);

  const totalDupaAdaugare = Number(await total.textContent());
  expect(totalDupaAdaugare).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Place Order" }).click();

  await orderCart(page, "Cosmin", "Romania", "Iasi", "1234", "Sept", "2026");
});

test("@functional Check if a user is able to send a message through Contact", async ({ page }) => {
  await sendMessage(page, "email@email.com", "Cosmin", "Hello World!");
});
