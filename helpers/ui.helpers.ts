import { Page } from "@playwright/test";

export async function openLogin(page: Page) {
  await page.getByRole("link", { name: "Log in" }).click();
}

export async function fillLoginForm(
  page: Page,
  username?: string,
  password?: string,
) {
  if (username !== undefined) {
    await page.locator("#loginusername").fill(username);
  }
  if (password !== undefined) {
    await page.locator("#loginpassword").fill(password);
  }
}

export async function openAndFillLogin(
  page: Page,
  username?: string,
  password?: string,
) {
  await openLogin(page);
  await fillLoginForm(page, username, password);
}

export async function openSignUp(page: Page) {
  await page.getByRole("link", { name: "Sign up" }).click();
}

export async function fillSignUpForm(
  page: Page,
  username?: string,
  password?: string,
) {
  if (username !== undefined) {
    await page.getByRole("textbox", { name: "Username:" }).fill(username);
  }

  if (password !== undefined) {
    await page.getByRole("textbox", { name: "Password:" }).fill(password);
  }
}

export async function openAndFillSignUp(
  page: Page,
  username?: string,
  password?: string,
) {
  await openSignUp(page);
  await fillSignUpForm(page, username, password);
}

export async function clickAndGetDialog(page: Page, buttonName: string) {
  const dialogPromise = page.waitForEvent("dialog");

  page.getByRole("button", { name: buttonName }).click({
    noWaitAfter: true,
  });

  return await dialogPromise;
}
