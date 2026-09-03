import { test, expect } from "@playwright/test";
import {
  openAndFillLogin,
  openAndFillSignUp,
  clickAndGetDialog,
} from "../helpers/ui.helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.demoblaze.com/");
});

test.describe("Negative Login Testing", () => {
  test("Check if an unregistered user is unable to login", async ({ page }) => {
    await openAndFillLogin(page, "unregistered_user_12345", "12341234");

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("User does not exist.");
    await dialog.dismiss();

    await expect(page.getByText("Welcome")).not.toBeVisible();
  });

  test("Check if a user is unable to login with a valid username and invalid password", async ({
    page,
  }) => {
    await openAndFillLogin(page, "alinmorosanu", "wrongpassword123");

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("Wrong password.");
    await dialog.dismiss();

    await expect(page.getByText("Welcome")).not.toBeVisible();
  });

  test("Check if a user is unable to login with an invalid username and valid password", async ({
    page,
  }) => {
    await openAndFillLogin(page, "invalid_user_12345", "12341234");

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("User does not exist.");
    await dialog.dismiss();

    await expect(page.getByText("Welcome")).not.toBeVisible();
  });

  test("Check if a user is unable to login with invalid username and password", async ({
    page,
  }) => {
    await openAndFillLogin(page, "invalid_user_007", "invalid_password_007");

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("User does not exist.");
    await dialog.dismiss();

    await expect(page.getByText("Welcome")).not.toBeVisible();
  });

  test("Check if a user is unable to login with empty fields", async ({
    page,
  }) => {
    await openAndFillLogin(page, undefined, undefined);

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("Please fill out Username and Password.");
    await dialog.dismiss();

    await expect(page.getByText("Welcome")).not.toBeVisible();
  });
});

test.describe("Negative Sign Up Testing", () => {
  test("Check if a user is unable to signup with an already registered username", async ({
    page,
  }) => {
    await openAndFillSignUp(page, "alinmorosanu", "12341234");

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("This user already exist.");
    await dialog.dismiss();
  });

  test("Check if a user is unable to signup with an empty username/password", async ({
    page,
  }) => {
    await openAndFillSignUp(page, undefined, undefined);

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("Please fill out Username and Password.");
    await dialog.dismiss();
  });
});

test.describe("Negative Order Testing", () => {
  test("Check if a user is unable to complete an order with empty required fields", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Samsung galaxy s6" }).click();

    const addToCartDialog = page.waitForEvent("dialog");

    await page.getByRole("link", { name: "Add to cart" }).click();

    const addDialog = await addToCartDialog;
    await addDialog.dismiss();

    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await page.getByRole("button", { name: "Place Order" }).click();

    const dialog = await clickAndGetDialog(page, "Purchase");

    expect(dialog.message()).toBe("Please fill out Name and Creditcard.");
    await dialog.dismiss();
  });

  test("Check if a user is unable to complete an order with invalid payment data", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Samsung galaxy s6" }).click();

    const addToCartDialog = page.waitForEvent("dialog");

    await page.getByRole("link", { name: "Add to cart" }).click();

    const addDialog = await addToCartDialog;
    await addDialog.dismiss();

    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await page.getByRole("button", { name: "Place Order" }).click();

    await page.locator("#name").fill("Alin Morosanu");
    await page.locator("#country").fill("Romania");
    await page.locator("#city").fill("Bucharest");

    await page.locator("#card").fill("abcdefghijkl");
    await page.locator("#month").fill("abc");
    await page.locator("#year").fill("xyz");

    await page.getByRole("button", { name: "Purchase" }).click();

    const confirmation = page.locator(".sweet-alert");

    await expect(confirmation).not.toContainText(
      "Thank you for your purchase!",
    );
  });
});

test.describe("Negative Authentication Input Testing", () => {
  test("Check if a user is unable to login with special characters", async ({
    page,
  }) => {
    await openAndFillLogin(page, "user_@#$%^&*", "P@ssw0rd!#$%^");

    const dialog = await clickAndGetDialog(page, "Log in");
    await dialog.dismiss();

    await expect(page.getByText("Welcome")).not.toBeVisible();
  });

  test("Check if a user enters excessively long input in authentication fields", async ({
    page,
  }) => {
    const longUsername = "a".repeat(1000);
    const longPassword = "b".repeat(1000);

    await openAndFillLogin(page, longUsername, longPassword);

    await expect(page.locator("#loginusername")).toHaveValue(longUsername);
    await expect(page.locator("#loginpassword")).toHaveValue(longPassword);

    const dialog = await clickAndGetDialog(page, "Log in");
    await dialog.dismiss();

    await expect(page.getByText("Welcome")).not.toBeVisible();
  });
});

test("Check if a user is unable to submit an invalid Contact form", async ({
  page,
}) => {
  await page.getByRole("link", { name: "Contact" }).click();

  await page.locator("#recipient-email").fill("invalid-email");
  await page.locator("#recipient-name").fill("Alin");
  await page.locator("#message-text").fill("Test message");

  const dialog = await clickAndGetDialog(page, "Send message");

  expect(dialog.message()).not.toBe("Thanks for the message!!");
  await dialog.dismiss();
});
