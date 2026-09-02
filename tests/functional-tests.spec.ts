import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.demoblaze.com");
});

test("Check if a user is able to open the homepage ", async ({ page }) => {
  await page.locator(".nav-link").getByText("Home").click();

  await expect(page).toHaveURL("https://www.demoblaze.com/index.html");
  await expect(page.locator(".card-title")).not.toHaveCount(0);
});

test("Check if a user is able to open the Phones category", async ({ page }) => {
  await page.locator(".list-group").getByText("Phones").click();

  await expect(page.locator(".card-title").first()).toContainText("Samsung");
});

test("Check if a user is able to open the Laptops category", async ({ page }) => {
  await page.locator(".list-group").getByText("Laptops").click();

  await expect(page.locator(".card-title").first()).toContainText("Sony");
});

test("Check if a user is able to open the Monitors category", async ({ page }) => {
  await page.locator(".list-group").getByText("Monitors").click();

  await expect(page.locator(".card-title").first()).toContainText("Apple");
});

test("Check if a user is able to open the cart ", async ({ page }) => {
  await page.locator(".nav-link").getByText("Cart").click();

  await expect(page).toHaveURL("https://www.demoblaze.com/cart.html");
});

test("Check if the About us section can be opened and closed", async ({ page }) => {
  const aboutModal = page.locator("#videoModal");
  await expect(aboutModal).toBeHidden();

  await page.locator(".nav-link").getByText("About us").click();
  await expect(aboutModal).toBeVisible();
  await expect(aboutModal.getByRole("heading", { name: "About Us" })).toBeVisible();

  await aboutModal.getByRole("button", { name: "Close", exact: true }).and(page.locator(".btn-secondary")).click();
  await expect(aboutModal).toBeHidden();
});

test("Check if the cart total is updated after adding or removing products", async ({ page }) => {
  await page.locator(".card-title a").first().click();
  await page.getByRole("link", { name: "Add to cart" }).click();

  await page.locator(".nav-link").getByText("Cart").click();
  const total = page.locator("#totalp");
  await expect(total).not.toHaveText("", { timeout: 10000 });

  expect(total).toHaveText(/^\d+$/);

  const totalDupaAdaugare = Number(await total.textContent());
  expect(totalDupaAdaugare).toBeGreaterThan(0);

  await page.locator("#tbodyid tr").first().getByRole("link", { name: "Delete" }).click();
  await expect(page.locator("#tbodyid tr")).toHaveCount(0, { timeout: 10000 });
  await expect(total).toHaveText("", { timeout: 10000 });
});

test("Check if a user is able to place an order with valid data and receive a confirmation message", async ({
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

  expect(total).toHaveText(/^\d+$/);

  const totalDupaAdaugare = Number(await total.textContent());
  expect(totalDupaAdaugare).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Place Order" }).click();

  await expect(orderModal).toBeVisible();
  await page.locator(".form-group").locator("#name").fill("Nume");
  await page.locator(".form-group").locator("#country").fill("Tara");
  await page.locator(".form-group").locator("#city").fill("Oras");
  await page.locator(".form-group").locator("#card").fill("0465");
  await page.locator(".form-group").locator("#month").fill("Sept");
  await page.locator(".form-group").locator("#year").fill("2026");

  await page.getByRole("button", { name: "Purchase" }).click();

  await expect(confirmationModal).toBeVisible();
  await page.getByRole("button", { name: "OK" }).click();
});

test("Check if a user is able to send a message through Contact", async ({ page }) => {
  const messageModal = page.locator("#exampleModal");
  await expect(messageModal).toBeHidden();

  await page.locator(".nav-link").getByText("Contact").click();
  await expect(messageModal).toBeVisible();
  await expect(messageModal).toHaveClass(/show/);
  await page.locator(".form-group").locator("#recipient-email").fill("Contact@email.com");
  await page.locator(".form-group").locator("#recipient-name").fill("Contact");
  await page.locator(".form-group").locator("#message-text").fill("Mesaj");

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Send message" }).click();

  await expect.poll(() => dialogMessage).not.toBe("");
  expect(dialogMessage).toBe("Thanks for the message!!");


  await expect(messageModal).toBeHidden();
});
