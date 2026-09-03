import { test, expect } from "@playwright/test";
import {
  openAndFillLogin,
  openAndFillSignUp,
  clickAndGetDialog,
} from "../helpers/ui.helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("https://www.demoblaze.com/");
});

test.describe("Sign Up Validation", () => {
  test("Sign Up works with valid username and password", async ({ page }) => {
    const username = `alinmorosanu${Date.now()}`;
    const password = "12341234";

    await openAndFillSignUp(page, username, password);

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("Sign up successful.");
    await dialog.dismiss();
  });

  test("Sign Up is rejected when the username is already registered", async ({
    page,
  }) => {
    await openAndFillSignUp(page, "alinmorosanu", "12341234");

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("This user already exist.");
    await dialog.dismiss();
  });

  test("Check if Sign Up is rejected when username field is empty", async ({
    page,
  }) => {
    await openAndFillSignUp(page, undefined, "12341234");

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("Please fill out Username and Password.");
    await dialog.dismiss();
  });

  test("Check if Sign Up is rejected when password field is empty", async ({
    page,
  }) => {
    await openAndFillSignUp(page, "alinmorosanu", undefined);

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("Please fill out Username and Password.");
    await dialog.dismiss();
  });

  test("Check if Sign Up is rejected when both fields are empty", async ({
    page,
  }) => {
    await openAndFillSignUp(page, undefined, undefined);

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("Please fill out Username and Password.");
    await dialog.dismiss();
  });

  test("Check if Sign Up handles special characters in password", async ({
    page,
  }) => {
    const username = `alinmorosanu${Date.now()}`;
    const password = "P@ssw0rd!#$";

    await openAndFillSignUp(page, username, password);

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).toBe("Sign up successful.");
    await dialog.dismiss();
  });

  test("Check if Sign Up handles special characters in username", async ({
    page,
  }) => {
    const username = `alinmorosanu_@#${Date.now()}`;
    const password = "12341234";

    await openAndFillSignUp(page, username, password);

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).not.toBe("Sign up successful.");
    await dialog.dismiss();
  });
});

test.describe("Login Validation", () => {
  test("Check if Log In works with valid username and password", async ({
    page,
  }) => {
    await openAndFillLogin(page, "alinmorosanu", "12341234");

    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Welcome alinmorosanu")).toBeVisible();
  });

  test("Check if Log In is rejected with an invalid password", async ({
    page,
  }) => {
    await openAndFillLogin(page, "alinmorosanu", "wrongpassword");

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("Wrong password.");
    await dialog.dismiss();
  });

  test("Check if Log In is rejected with an invalid username", async ({
    page,
  }) => {
    await openAndFillLogin(page, "alinmorosanu007", "12341234");

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("User does not exist.");
    await dialog.dismiss();
  });

  test("Check if Log In is rejected when both fields are empty", async ({
    page,
  }) => {
    await openAndFillLogin(page, undefined, undefined);

    const dialog = await clickAndGetDialog(page, "Log in");

    expect(dialog.message()).toBe("Please fill out Username and Password.");
    await dialog.dismiss();
  });
});

test.describe("Username and password boundary length", () => {
  test("Check if Sign Up accepts minimum length username and password", async ({
    page,
  }) => {
    await openAndFillSignUp(page, "§", "§");

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).not.toBe("Sign up successful.");
    await dialog.dismiss();
  });

  test("Check if Sign Up accepts maximum length username and password", async ({
    page,
  }) => {
    const username = "a".repeat(2000);
    const password = "b".repeat(2000);

    await openAndFillSignUp(page, username, password);

    const dialog = await clickAndGetDialog(page, "Sign up");

    expect(dialog.message()).not.toBe("Sign up successful.");
    await dialog.dismiss();
  });
});

test.describe("Contact Form Validation", () => {
  test("Check if Contact form validates empty email field", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Contact" }).click();

    await page.locator("#recipient-name").fill("Alin");
    await page.locator("#message-text").fill("Test message");

    const dialog = await clickAndGetDialog(page, "Send message");

    expect(dialog.message()).not.toBe("Thanks for the message!!");
    await dialog.dismiss();
  });

  test("Check if Contact form validates empty name field", async ({ page }) => {
    await page.getByRole("link", { name: "Contact" }).click();

    await page.locator("#recipient-email").fill("test@test.com");
    await page.locator("#message-text").fill("Test message");

    const dialog = await clickAndGetDialog(page, "Send message");

    expect(dialog.message()).not.toBe("Thanks for the message!!");
    await dialog.dismiss();
  });

  test("Check if Contact form validates empty message field", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Contact" }).click();

    await page.locator("#recipient-email").fill("test@test.com");
    await page.locator("#recipient-name").fill("Alin");

    const dialog = await clickAndGetDialog(page, "Send message");

    expect(dialog.message()).not.toBe("Thanks for the message!!");
    await dialog.dismiss();
  });
});

test.describe("Place Order Validation", () => {
  test("Check if Place Order validates empty customer fields and missing payment information", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Samsung galaxy s6" }).click();

    const addToCartDialog = page.waitForEvent("dialog");

    await page.getByRole("link", { name: "Add to cart" }).click();

    const addDialog = await addToCartDialog;
    await addDialog.dismiss();

    await page.getByRole("link", { name: "Cart", exact: true }).click();
    await page.getByRole("button", { name: "Place Order" }).click();

    const purchaseDialog = page.waitForEvent("dialog");

    await page.getByRole("button", { name: "Purchase" }).click();

    const dialog = await purchaseDialog;

    expect(dialog.message()).toBe("Please fill out Name and Creditcard.");
    await dialog.dismiss();
  });

  test("Check if Place Order handles alphabetic characters in numeric fields", async ({
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

    await expect(confirmation).toBeVisible();
    await expect(confirmation).not.toContainText(
      "Thank you for your purchase!",
    );
  });
});
