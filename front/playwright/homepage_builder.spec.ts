import { test as base, expect } from '@playwright/test';

import { Homepage } from './fixtures/homepage';
import { User } from './fixtures/user';

const test = base.extend<{ user: User; homepage: Homepage }>({
  user: async ({ page, context }, use) => {
    const user = new User(page, context);
    await use(user);
  },
  homepage: async ({ page }, use) => {
    const homepage = new Homepage(page);
    await use(homepage);
  },
});

test.describe('Homepage builder', () => {
  test.skip('updates and delete homepage builder content correctly', async ({
    page,
    user,
    homepage,
  }) => {
    await homepage.updateMinimalHomepage();

    // go to admin page
    await user.loginAsAdmin();
    await page.goto('/admin/pages-menu/');

    // go to page with homepage builder
    await page
      .locator('[data-cy="e2e-navbar-item-edit-button"]')
      .first()
      .click();

    await page
      .locator('#e2e-draggable-two-column')
      .dragTo(page.locator('#ROOT'));

    // Components added to all columns
    await page
      .locator('#e2e-draggable-text-multiloc')
      .dragTo(page.locator('.e2e-single-column').first(), {
        force: true,
      });

    await page.locator('.e2e-text-box').first().click({ force: true });
    await page.locator('.ql-editor').fill('first text');

    // Proposals
    await page
      .locator('#e2e-draggable-proposals')
      .dragTo(page.locator('#ROOT'));

    // Events
    await page.locator('#e2e-draggable-events').dragTo(page.locator('#ROOT'));

    // Customize projects title
    await page.locator('[data-cy="e2e-projects"]').click({
      force: true,
    });
    await page.locator('#project_title').fill('Custom projects title');
    await page.locator('#e2e-content-builder-topbar-save').click();
    await page.waitForResponse(/homepage\/upsert/);

    await user.logout();

    await page.goto(`/`);
    await expect(page.locator('#e2e-two-column')).toBeVisible();

    await expect(page.locator('div.e2e-text-box').first()).toHaveText(
      /first text/
    );

    await expect(page.locator('[data-cy="e2e-projects"]')).toHaveText(
      /Custom projects title/
    );
    await expect(page.locator('[data-cy="e2e-events"]')).toBeVisible();
    await expect(page.locator('[data-cy="e2e-proposals"]')).toBeVisible();

    await user.loginAsAdmin();
    // go to admin page
    await page.goto('/admin/pages-menu/');

    // go to page with homepage builder
    await page
      .locator('[data-cy="e2e-navbar-item-edit-button"]')
      .first()
      .click();
    await expect(page.locator('#e2e-two-column')).toBeVisible();

    // Delete two column
    await page.locator('#e2e-two-column').click({ force: true });
    await page.locator('#e2e-delete-button').click();

    // Delete events
    await expect(page.locator('[data-cy="e2e-events"]')).toBeVisible();
    await page.locator('[data-cy="e2e-events"]').click({ force: true });
    await page.locator('#e2e-delete-button').click();

    // Delete proposals
    await expect(page.locator('[data-cy="e2e-proposals"]')).toBeVisible();
    await page.locator('[data-cy="e2e-proposals"]').click({ force: true });
    await page.locator('#e2e-delete-button').click();

    // Clear projects title
    await page.locator('[data-cy="e2e-projects"]').click({ force: true });

    // Projects are not deletable
    await expect(page.locator('#e2e-delete-button')).not.toBeVisible();
    await page.locator('#project_title').clear();
    await page.locator('#e2e-content-builder-topbar-save').click();

    await page.waitForResponse(/homepage\/upsert/);

    await page.goto(`/`);
    await expect(page.locator('#e2e-two-column')).not.toBeVisible();
    await expect(page.locator('div.e2e-text-box')).not.toBeVisible();
    await expect(page.locator('[data-cy="e2e-events"]')).not.toBeVisible();
    await expect(page.locator('[data-cy="e2e-proposals"]')).not.toBeVisible();

    await expect(page.locator('[data-cy="e2e-projects"]')).toHaveText(
      /is currently working on/
    );
  });

  //   test.skip('updates homepage banner correctly', async ({ page }) => {
  //     page.FIXME_setAdminLoginCookie();
  //     page.FIXME_apiUpdateHomepageLayout({
  //       craftjs_json: homepageMinimalData,
  //     });
  //     page.FIXME_logout();
  //     const saveHomePage = page.waitForResponse(
  //       '**/home_pages/content_builder_layouts/homepage/upsert'
  //     );
  //     const getHomePage = page.waitForResponse(
  //       '**/home_pages/content_builder_layouts/homepage'
  //     );
  //     const getAppConfiguration = page.waitForResponse('**/app_configuration');
  //     const getPages = page.waitForResponse('**/pages-menu');
  //     const getNavbarItems = page.waitForResponse('**/nav_bar_items');
  //     const postImage = page.waitForResponse('**/content_builder_layout_images');
  //     const getAdminPublications = page.waitForResponse(
  //       '**/admin_publications**'
  //     );

  //     // Check homepage banner defaults signed - out
  //     await page.goto('/');
  //     await expect(page.locator('[data-cy="e2e-homepage-banner"]')).toBeVisible();
  //     await expect(
  //       page.locator('[data-cy="e2e-full-width-banner-layout-container"]')
  //     ).toBeVisible();

  //     const signedOutHeaderEnglish = /Let’s shape the future of/gi;
  //     const signedOutSubheaderEnglish =
  //       /Welcome to the participation platform of/gi;
  //     await expect(async () => {
  //       const $el = page.locator('#hook-header-content');
  //       const text = await $el.textContent();
  //       expect(text).toMatch(signedOutHeaderEnglish);
  //     }).toPass();
  //     await expect(async () => {
  //       const $el = page.locator('#hook-header-content');
  //       const text = await $el.textContent();
  //       expect(text).toMatch(signedOutSubheaderEnglish);
  //     }).toPass();
  //     await expect(
  //       page
  //         .locator('#hook-header-content')
  //         .locator('[data-testid=avatarBubblesContainer]')
  //     ).toBeVisible();
  //     await expect(
  //       page.locator('[data-cy=e2e-full-width-layout-header-image-overlay]')
  //     ).toBeVisible();
  //     await expect(
  //       page.locator('[data-cy=e2e-full-width-layout-header-image-overlay]')
  //     ).toHaveCSS('background-color', 'rgb(10, 81, 89)');
  //     await expect(
  //       page.locator('[data-cy=e2e-full-width-layout-header-image-overlay]')
  //     ).toHaveCSS('opacity', '0.9');
  //     await expect(page.locator('.buttonText')).toHaveText(/Sign up/);

  //     // Check homepage banner defaults signed - in
  //     page.FIXME_setAdminLoginCookie();
  //     await page.goto('/');
  //     await expect(page.locator('.e2e-signed-in-header')).toBeVisible();
  //     await expect(
  //       page.locator("[data-cy='e2e-signed-in-header-image-overlay']")
  //     ).toHaveCSS('background-color', 'rgb(10, 81, 89)');
  //     await expect(
  //       page.locator("[data-cy='e2e-signed-in-header-image-overlay']")
  //     ).toHaveCSS('opacity', '0.9');
  //     await expect(
  //       page.locator("[data-cy='e2e-signed-in-header-image']")
  //     ).not.toBeVisible();

  //     // Go to admin page
  //     await page.goto('/admin/pages-menu/homepage-builder');

  //     // Update homepage banner
  //     await page.locator('[data-cy="e2e-homepage-banner"]').click();

  //     // Homepage bannner is not deletable
  //     await expect(page.locator('#e2e-delete-button')).not.toBeVisible();

  //     // Update image
  //     page.locator('#bannerImage').FIXME_attachFile('testimage.png');

  //     // Update avatar bubbles
  //     await page
  //       .locator('[data-cy="e2e-banner-avatar-toggle"]')
  //       .locator('i')
  //       .click();

  //     // Update header and subheader
  //     await page
  //       .locator('[data-cy="e2e-signed-out-header-section"]')
  //       .locator('input')
  //       .clear();
  //     await page
  //       .locator('[data-cy="e2e-signed-out-header-section"]')
  //       .locator('input')
  //       .fill('New header');
  //     await page
  //       .locator('[data-cy="e2e-signed-out-subheader-section"]')
  //       .locator('input')
  //       .clear();
  //     await page
  //       .locator('[data-cy="e2e-signed-out-subheader-section"]')
  //       .locator('input')
  //       .fill('New subheader');

  //     // Update custom button
  //     await page.locator('#cta-type-customized_button').click();
  //     await page.locator('#customizedButtonText').clear();
  //     await page.locator('#customizedButtonText').fill('Custom button');
  //     await page.locator('#customizedButtonUrl').clear();
  //     await page.locator('#customizedButtonUrl').fill('https://www.google.com');

  //     // Signed - in header
  //     await page.locator('#e2e-signed-in-button').click();

  //     // Update header
  //     await page
  //       .locator('[data-cy="e2e-signed-in-header-section"]')
  //       .locator('input')
  //       .clear();
  //     await page
  //       .locator('[data-cy="e2e-signed-in-header-section"]')
  //       .locator('input')
  //       .fill('New header');
  //     await page.locator('#cta-type-customized_button').click();
  //     await page.locator('#customizedButtonText').clear();
  //     await page.locator('#customizedButtonText').fill('Custom button');
  //     await page.locator('#customizedButtonUrl').clear();
  //     await page.locator('#customizedButtonUrl').fill('https://www.google.com');
  //     await expect(
  //       page.locator("[data-cy='e2e-signed-in-header-image']")
  //     ).toBeVisible();
  //     await expect(page.locator('.buttonText')).toHaveText(/Custom button/);
  //     await expect(page.locator("[data-cy='e2e-homepage-banner']")).toHaveText(
  //       /New header/
  //     );

  //     // Save homepage
  //     await page.locator('#e2e-content-builder-topbar-save').click();

  //     // Check updated content signed - out
  //     page.FIXME_logout();
  //     await page.goto('/');
  //     await expect(page.locator('[data-cy="e2e-homepage-banner"]')).toBeVisible();
  //     await expect(
  //       page.locator('[data-cy="e2e-full-width-banner-layout-container"]')
  //     ).toBeVisible();
  //     await expect(
  //       page.locator('[data-cy="e2e-full-width-banner-layout-header-image"]')
  //     ).toHaveCSS('background-image', /.*/);
  //     await expect
  //       .poll(async () =>
  //         page.locator('[data-cy="e2e-full-width-banner-layout-header-image"]')
  //       )
  //       .toContain('.png');
  //     await expect(
  //       page
  //         .locator('#hook-header-content')
  //         .locator('[data-testid=avatarBubblesContainer]')
  //     ).not.toBeVisible();
  //     await expect(page.locator('#hook-header-content')).toHaveText(/New header/);
  //     await expect(page.locator('#hook-header-content')).toHaveText(
  //       /New subheader/
  //     );
  //     await expect(page.locator('.buttonText')).toHaveText(/Custom button/);
  //   });

  //   test.skip('updates homepage banner layout correctly fixed ratio', async ({
  //     page,
  //   }) => {
  //     const saveHomePage = page.waitForResponse(
  //       '**/home_pages/content_builder_layouts/homepage/upsert'
  //     );
  //     const postImage = page.waitForResponse('**/content_builder_layout_images');
  //     const getHomePage = page.waitForResponse(
  //       '**/home_pages/content_builder_layouts/homepage'
  //     );
  //     const getAppConfiguration = page.waitForResponse('**/app_configuration');
  //     const getAdminPublications = page.waitForResponse(
  //       '**/admin_publications**'
  //     );

  //     // Fixed ratio layout
  //     page.FIXME_setAdminLoginCookie();
  //     await page.goto('/admin/pages-menu/homepage-builder');
  //     await page.locator('[data-cy="e2e-homepage-banner"]').click();
  //     await page.locator('[data-cy="e2e-fixed-ratio-layout-option"]').click();
  //     await page.locator('#e2e-content-builder-topbar-save').click();
  //     page.FIXME_logout();
  //     await page.goto('/');
  //     await expect(page.locator('[data-cy="e2e-homepage-banner"]')).toBeVisible();
  //     await expect(
  //       page.locator('[data-cy="e2e-fixed-ratio-layout-container"]')
  //     ).toBeVisible();
  //   });

  //   test.skip('updates homepage banner layout correctly two row', async ({
  //     page,
  //   }) => {
  //     const saveHomePage = page.waitForResponse(
  //       '**/home_pages/content_builder_layouts/homepage/upsert'
  //     );
  //     const postImage = page.waitForResponse('**/content_builder_layout_images');
  //     const getHomePage = page.waitForResponse(
  //       '**/home_pages/content_builder_layouts/homepage'
  //     );
  //     const getAppConfiguration = page.waitForResponse('**/app_configuration');
  //     const getAdminPublications = page.waitForResponse(
  //       '**/admin_publications**'
  //     );

  //     // Two row layout
  //     page.FIXME_setAdminLoginCookie();
  //     await page.goto('/admin/pages-menu/homepage-builder');
  //     await page.locator('[data-cy="e2e-homepage-banner"]').click();
  //     await page.locator('[data-cy="e2e-two-row-layout-option"]').click();
  //     await page.locator('#e2e-content-builder-topbar-save').click();
  //     page.FIXME_logout();
  //     await page.goto('/');
  //     await expect(page.locator('[data-cy="e2e-homepage-banner"]')).toBeVisible();
  //     await expect(
  //       page.locator('[data-cy="e2e-two-row-layout-container"]')
  //     ).toBeVisible();
  //   });
});
