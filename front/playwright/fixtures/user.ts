import type { Page, BrowserContext } from '@playwright/test';

export async function loginRequest(
  page: Page,
  email: string,
  password: string
) {
  return (async () => {
    const response = await page.request.post('/web_api/v1/user_token', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        auth: {
          email,
          password,
          remember_me: false,
        },
      },
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  })();
}

export async function loginAsAdminRequest(page: Page) {
  return (async () => {
    const response = await page.request.post('/web_api/v1/user_token', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        auth: {
          email: 'admin@citizenlab.co',
          password: 'democracy2.0',
        },
      },
    });
    const jsonResponse = await response.json();
    return jsonResponse;
  })();
}

export class User {
  constructor(
    public readonly page: Page,
    public readonly context: BrowserContext
  ) {}

  async login(email: string, password: string) {
    const response = await loginRequest(this.page, email, password);
    await this.context.addCookies([
      {
        name: 'cl2_jwt',
        value: response.jwt,
        path: '/',
        domain: 'localhost',
      },
    ]);
  }

  async loginAsAdmin() {
    const response = await loginAsAdminRequest(this.page);
    await this.context.addCookies([
      {
        name: 'cl2_jwt',
        value: response.jwt,
        path: '/',
        domain: 'localhost',
      },
    ]);
  }

  async logout() {
    await this.context.clearCookies({ name: 'cl2_jwt' });
  }
}
