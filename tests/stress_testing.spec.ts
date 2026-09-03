import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.demoblaze.com/");
});

test("Check application stability and recovery when expected capacity is exceeded", async ({
  browser,
}) => {
  const pages = await Promise.all(
    Array.from({ length: 20 }, async () => {
      const page = await browser.newPage();

      await page.goto("https://www.demoblaze.com/");

      return page;
    }),
  );

  for (const page of pages) {
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  }

  // Close all pages after the load test
  await Promise.all(pages.map((page) => page.close()));

  // Verify that the application is still accessible after the load
  const recoveryPage = await browser.newPage();

  await recoveryPage.goto("https://www.demoblaze.com/");

  await expect(recoveryPage.getByRole("link", { name: "Home" })).toBeVisible();

  await recoveryPage.close();
});

test("Check that the system handles excessive load without critical failures or data corruption", async ({
  browser,
}) => {
  const pages = await Promise.all(
    Array.from({ length: 20 }, async () => {
      const page = await browser.newPage();

      await page.goto("https://www.demoblaze.com/");

      return page;
    }),
  );

  await Promise.all(
    pages.map(async (page) => {
      await page.getByRole("link", { name: "Samsung galaxy s6" }).click();

      const addToCartDialog = page.waitForEvent("dialog");

      page.getByRole("link", { name: "Add to cart" }).click();

      const dialog = await addToCartDialog;

      expect(dialog.message()).toBe("Product added");

      await dialog.dismiss();
    }),
  );

  // Verify that each session can still access the cart
  await Promise.all(
    pages.map(async (page) => {
      await page.getByRole("link", { name: "Cart", exact: true }).click();

      await expect(
        page.getByRole("button", { name: "Place Order" }),
      ).toBeVisible();
    }),
  );

  await Promise.all(pages.map((page) => page.close()));
});
