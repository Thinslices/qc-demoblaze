import { Page, expect, test } from "@playwright/test";

export async function LogIn(page: Page) {
  await page.goto("https://www.demoblaze.com");
  const logInModal = page.locator("#logInModal");
  await expect(logInModal).toBeHidden();
  const welcomeUser = page.locator("#nameofuser");

  await page.locator(".nav-link").getByText("Log in").click();
  await expect(logInModal).toBeVisible();

  await page.locator(".form-group").locator("#loginusername").fill(`${process.env.VALID_USER}`);
  await page.locator(".form-group").locator("#loginpassword").fill(`${process.env.VALID_PASSWORD}`);

  await page.getByRole("button", { name: "Log in" }).click();
  await expect(logInModal).toBeHidden();
  await expect(welcomeUser.getByText("Welcome usernameValid")).toBeVisible();
}

export async function SignInWithGeneratedCredentials(page: Page) {
  await page.goto("https://www.demoblaze.com");
  const signInModal = page.locator("#signInModal");
  await expect(signInModal).toBeHidden();

  await page.locator(".nav-link").getByText("Sign up").click();
  await expect(signInModal).toBeVisible();

  await page.locator(".form-group").locator("#sign-username").fill(`${process.env.NEW_USER}${Date.now()}`);
  await page.locator(".form-group").locator("#sign-password").fill(`${process.env.NEW_PASSWORD}${Date.now()}`);

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Sign up" }).click();

  await expect.poll(() => dialogMessage).not.toBe("");
  expect(dialogMessage).toBe("Sign up successful.");

  await expect(signInModal).toBeHidden();
}

export async function SignInWithCredentials(page: Page, username: String, password: String) {
  await page.goto("https://www.demoblaze.com");
  const signInModal = page.locator("#signInModal");
  await expect(signInModal).toBeHidden();

  await page.locator(".nav-link").getByText("Sign up").click();
  await expect(signInModal).toBeVisible();

  await page.locator(".form-group").locator("#sign-username").fill(`${username}`);
  await page.locator(".form-group").locator("#sign-password").fill(`${password}`);

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Sign up" }).click();

  await expect.poll(() => dialogMessage).not.toBe("");
  expect(dialogMessage).toBe("Sign up successful.");

  await expect(signInModal).toBeHidden();
}
