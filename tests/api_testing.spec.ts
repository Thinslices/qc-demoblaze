import { test, expect } from "@playwright/test";

const API_URL = "https://api.demoblaze.com";

test("Check if product list API returns a successful response", async ({
  request,
}) => {
  const response = await request.get(`${API_URL}/entries`);

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body).toHaveProperty("Items");
  expect(Array.isArray(body.Items)).toBeTruthy();
  expect(body.Items.length).toBeGreaterThan(0);
});

test("Check if product category API returns a successful response", async ({
  request,
}) => {
  const response = await request.post(`${API_URL}/bycat`, {
    data: {
      cat: "phone",
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body).toHaveProperty("Items");
  expect(Array.isArray(body.Items)).toBeTruthy();
  expect(body.Items.length).toBeGreaterThan(0);

  for (const product of body.Items) {
    expect(product.cat).toBe("phone");
  }
});

test("Check if product details API returns a successful response", async ({
  request,
}) => {
  const response = await request.post(`${API_URL}/view`, {
    data: {
      id: 1,
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body).toHaveProperty("id");
  expect(body).toHaveProperty("title");
  expect(body).toHaveProperty("price");
  expect(body).toHaveProperty("desc");
  expect(body).toHaveProperty("cat");
  expect(body).toHaveProperty("img");

  expect(body.id).toBe(1);
});

test("Check if login API accepts valid credentials", async ({ request }) => {
  const response = await request.post(`${API_URL}/login`, {
    data: {
      username: "alinmorosanu",
      password: "MTIzNDEyMzQ=", //base64(12341234)
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.text();

  expect(body).toContain("Auth_token");
});

test("Check if login API rejects invalid credentials", async ({ request }) => {
  const response = await request.post(`${API_URL}/login`, {
    data: {
      username: "alinmorosanu",
      password: "wrongpassword",
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.text();

  expect(body).toContain("Wrong password.");
});

test("Check if signup API creates a new user with valid data", async ({
  request,
}) => {
  const username = `user${Date.now()}`;
  const password = "12341234";

  const signupResponse = await request.post(`${API_URL}/signup`, {
    data: {
      username,
      password,
    },
  });

  expect(signupResponse.status()).toBe(200);

  const loginResponse = await request.post(`${API_URL}/login`, {
    data: {
      username,
      password,
    },
  });

  expect(loginResponse.status()).toBe(200);

  const loginBody = await loginResponse.text();

  expect(loginBody).toContain("Auth_token");
});

test("Check if signup API rejects an already existing username", async ({
  request,
}) => {
  const response = await request.post(`${API_URL}/signup`, {
    data: {
      username: "alinmorosanu",
      password: "12341234",
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.text();

  expect(body).toContain("This user already exist.");
});

test("Check if signup API rejects incomplete data", async ({ request }) => {
  const response = await request.post(`${API_URL}/signup`, {
    data: {
      username: "",
      password: "12341234",
    },
  });

  expect(response.status()).toBe(500);
});

test("Check if cart API returns the correct products for the user", async ({
  request,
}) => {
  const userId = `apiuser${Date.now()}`;

  const firstAddResponse = await request.post(`${API_URL}/addtocart`, {
    data: {
      id: crypto.randomUUID(),
      cookie: userId,
      prod_id: 1,
      flag: false,
    },
  });

  expect(firstAddResponse.status()).toBe(200);

  const secondAddResponse = await request.post(`${API_URL}/addtocart`, {
    data: {
      id: crypto.randomUUID(),
      cookie: userId,
      prod_id: 2,
      flag: false,
    },
  });

  expect(secondAddResponse.status()).toBe(200);

  const cartResponse = await request.post(`${API_URL}/viewcart`, {
    data: {
      cookie: userId,
      flag: false,
    },
  });

  expect(cartResponse.status()).toBe(200);

  const body = await cartResponse.json();

  expect(body).toHaveProperty("Items");
  expect(Array.isArray(body.Items)).toBeTruthy();

  expect(body.Items).toContainEqual(
    expect.objectContaining({
      prod_id: 1,
    }),
  );

  expect(body.Items).toContainEqual(
    expect.objectContaining({
      prod_id: 2,
    }),
  );

  expect(body.Items).toHaveLength(2);
});

test("Check if delete-cart-item API removes the selected product", async ({
  request,
}) => {
  const userId = `apiuser${Date.now()}`;

  const product1Id = crypto.randomUUID();
  const product2Id = crypto.randomUUID();

  const firstAddResponse = await request.post(`${API_URL}/addtocart`, {
    data: {
      id: product1Id,
      cookie: userId,
      prod_id: 1,
      flag: false,
    },
  });

  expect(firstAddResponse.status()).toBe(200);

  const secondAddResponse = await request.post(`${API_URL}/addtocart`, {
    data: {
      id: product2Id,
      cookie: userId,
      prod_id: 2,
      flag: false,
    },
  });

  expect(secondAddResponse.status()).toBe(200);

  const deleteResponse = await request.post(`${API_URL}/deleteitem`, {
    data: {
      cookie: userId,
      id: product1Id,
    },
  });

  expect(deleteResponse.status()).toBe(200);

  const cartResponse = await request.post(`${API_URL}/viewcart`, {
    data: {
      cookie: userId,
      flag: false,
    },
  });

  expect(cartResponse.status()).toBe(200);

  const cartBody = await cartResponse.json();

  expect(cartBody).toHaveProperty("Items");
  expect(Array.isArray(cartBody.Items)).toBeTruthy();

  expect(cartBody.Items).not.toContainEqual(
    expect.objectContaining({
      prod_id: 1,
    }),
  );

  expect(cartBody.Items).toContainEqual(
    expect.objectContaining({
      prod_id: 2,
    }),
  );

  expect(cartBody.Items).toHaveLength(1);
});

test("Check if API returns the expected response structure/HTTP status code", async ({
  request,
}) => {
  const response = await request.get(`${API_URL}/entries`);

  expect(response.status()).toBe(200);

  const body = await response.json();

  expect(body).toHaveProperty("Items");
  expect(Array.isArray(body.Items)).toBeTruthy();
  expect(body.Items.length).toBeGreaterThan(0);

  for (const product of body.Items) {
    expect(product).toHaveProperty("id");
    expect(product).toHaveProperty("title");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("cat");
    expect(product).toHaveProperty("desc");
    expect(product).toHaveProperty("img");
  }
});

test("Check if API handles malformed requests correctly", async ({
  request,
}) => {
  const response = await request.post(`${API_URL}/view`, {
    data: {
      id: "invalid-id",
    },
  });

  expect(response.status()).toBe(500);
});

test("Check if API handles missing required parameters correctly", async ({
  request,
}) => {
  const response = await request.post(`${API_URL}/view`, {
    data: {},
  });

  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body).toHaveProperty("errorMessage");
  expect(body.errorMessage).toBe("Product not found.");
});

test("Check if API response time remains within the defined threshold", async ({
  request,
}) => {
  const startTime = Date.now();

  const response = await request.get(`${API_URL}/entries`);

  const responseTime = Date.now() - startTime;

  expect(response.status()).toBe(200);
  expect(responseTime).toBeLessThan(3000);
});

test("Check if unauthorized or invalid requests are rejected appropriately", async ({
  request,
}) => {
  const response = await request.post(`${API_URL}/view`, {
    data: {
      id: 999999,
    },
  });

  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body).toHaveProperty("errorMessage");
  expect(body.errorMessage).toBe("Not found.");
});
