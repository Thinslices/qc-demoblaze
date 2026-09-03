import { test, expect } from "@playwright/test";

test("Check page actions response time under expected user load", async ({ page }) => {
  await page.goto("https://www.demoblaze.com");

  const start = Date.now();
  await page.locator(".card-title a").first().click();
  const pageLoadTime = Date.now() - start;

  console.log(`Item page loading time: ${pageLoadTime}ms`);
  expect(pageLoadTime).toBeLessThan(5000);

  const addToCartStart = Date.now();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("link", { name: "Add to cart" }).click();
  await page.waitForEvent("dialog").catch(() => {});
  const addToCartEnd = Date.now() - addToCartStart;

  console.log(`Add to cart response time: ${addToCartEnd}ms`);
  expect(addToCartEnd).toBeLessThan(3000);
});
