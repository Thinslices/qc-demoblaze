import { Page, expect } from "@playwright/test";

export async function logIn(page: Page) {
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

export async function logInWithCredentials(page: Page, username: String, password: String) {
  await page.goto("https://www.demoblaze.com");
  const logInModal = page.locator("#logInModal");
  await expect(logInModal).toBeHidden();
  const welcomeUser = page.locator("#nameofuser");

  await page.locator(".nav-link").getByText("Log in").click();
  await expect(logInModal).toBeVisible();

  await page.locator(".form-group").locator("#loginusername").fill(`${username}`);
  await page.locator(".form-group").locator("#loginpassword").fill(`${password}`);

  await page.getByRole("button", { name: "Log in" }).click();
  await expect(logInModal).toBeHidden();
  await expect(welcomeUser.getByText(`Welcome ${username}`)).toBeVisible();
}

export async function signInWithGeneratedCredentials(page: Page) {
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

export async function signInWithCredentials(page: Page, username: String, password: String) {
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

export async function addFirstItemToCart(page: Page) {
  await page.locator(".card-title a").first().click();
  await page.getByRole("link", { name: "Add to cart" }).click();
  await page.locator(".nav-link").getByText("Home").click();
}

export async function addItemToCart(page: Page, item: String) {
  await page.locator(".card-title a").getByText(`${item}`).click();
  await page.getByRole("link", { name: "Add to cart" }).click();
  await page.locator(".nav-link").getByText("Home").click();
}

export async function orderCart(
  page: Page,
  name: String,
  country: String,
  city: String,
  card: String,
  month: String,
  year: String,
) {
  const orderModal = page.locator("#orderModalLabel");
  await expect(orderModal).toBeHidden();
  const confirmationModal = page.locator(".sweet-overlay");
  await expect(confirmationModal).toBeHidden();

  await expect(orderModal).toBeVisible();
  await page.locator(".form-group").locator("#name").fill(`${name}`);
  await page.locator(".form-group").locator("#country").fill(`${country}`);
  await page.locator(".form-group").locator("#city").fill(`${city}`);
  await page.locator(".form-group").locator("#card").fill(`${card}`);
  await page.locator(".form-group").locator("#month").fill(`${month}`);
  await page.locator(".form-group").locator("#year").fill(`${year}`);

  await page.getByRole("button", { name: "Purchase" }).click();

  await expect(confirmationModal).toBeVisible();
  await page.getByRole("button", { name: "OK" }).click();
}

export async function sendMessage(page: Page, email: String, contactName: String, message: String) {
  await page.goto("https://www.demoblaze.com");
  const messageModal = page.locator("#exampleModal");
  await expect(messageModal).toBeHidden();

  await page.locator(".nav-link").getByText("Contact").click();
  await expect(messageModal).toBeVisible();
  await expect(messageModal).toHaveClass(/show/);
  await page.locator(".form-group").locator("#recipient-email").fill(`${email}`);
  await page.locator(".form-group").locator("#recipient-name").fill(`${contactName}`);
  await page.locator(".form-group").locator("#message-text").fill(`${message}`);

  let dialogMessage = "";
  page.once("dialog", async (dialog) => {
    dialogMessage = dialog.message();
    await dialog.accept();
  });

  await page.getByRole("button", { name: "Send message" }).click();

  await expect.poll(() => dialogMessage).not.toBe("");
  expect(dialogMessage).toBe("Thanks for the message!!");

  await expect(messageModal).toBeHidden();
}
