import { test, expect } from "@playwright/test";

test("@performance Check page actions response time under expected user load", async ({ page }) => {
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

test("@perfomance Check application response time with multiple concurrent users", async ({ browser }) => {
  const userCount = 10;

  const start = Date.now();
  const results = await Promise.all(
    Array.from({ length: userCount }, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const t0 = Date.now();
      const response = await page.goto("https://www.demoblaze.com");
      const time = Date.now() - t0;
      await context.close();
      return { status: response?.status(), time };
    }),
  );

  const totalTime = Date.now() - start;
  console.log(`Total response time for ${userCount} concurent users: ${totalTime}ms`);

  const errors = results.filter((r) => r.status !== 200).length;
  const errorRate = errors / userCount;
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / userCount;

  console.log(`Average response time: ${avgTime}ms`);
  console.log(`Error rate: ${(errorRate * 100).toFixed(1)}%`);

  expect(avgTime).toBeLessThan(3000);
  expect(errorRate).toBeLessThan(0.05);
});
