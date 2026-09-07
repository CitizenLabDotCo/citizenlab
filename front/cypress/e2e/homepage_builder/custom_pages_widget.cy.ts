import { randomString } from '../../support/commands';

// craft.js renders the builder frame straight away and only deserializes the
// saved layout into it once the layout request comes back, replacing whatever
// the canvas held. Dropping a widget in before that happens loses it, and a
// `not.exist` check before it passes for the wrong reason.
function waitForLayoutToRender() {
  cy.get('#e2e-content-builder-frame').children().should('have.length.gt', 0);
}

function goToHomepageBuilder() {
  cy.setAdminLoginCookie();
  cy.visit('en/admin/pages-menu/homepage-builder');
  waitForLayoutToRender();
}

function goToHomepage() {
  cy.goToLandingPage();
  waitForLayoutToRender();
}

function saveHomepage() {
  cy.intercept(
    'POST',
    '**/home_pages/content_builder_layouts/homepage/upsert'
  ).as('updateHomepage');
  cy.get('#e2e-content-builder-topbar-save').click();
  cy.wait('@updateHomepage').its('response.statusCode').should('eq', 200);
}

describe('Custom Pages widget', () => {
  const pageTitle = randomString(8);
  let customPageId: string;
  let homepageLayout: Record<string, unknown>;

  before(() => {
    cy.apiGetHomepageLayout().then((layout) => {
      homepageLayout = layout.body.data.attributes.craftjs_json;
    });
    // Create a custom page so it can be selected in the widget
    cy.apiCreateCustomPage(pageTitle).then((page) => {
      customPageId = page.body.data.id;
    });
  });

  beforeEach(() => {
    // The widget this test adds is saved to the homepage, so it outlives the
    // test. Without putting the layout back, a retry after a failed attempt
    // finds two widgets, and cy.click() rejects a multi-element subject.
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
  });

  after(() => {
    cy.apiUpdateHomepageLayout({ craftjs_json: homepageLayout });
    if (customPageId) {
      cy.apiRemoveCustomPage(customPageId);
    }
  });

  it('can be added', () => {
    goToHomepageBuilder();

    cy.get('#e2e-draggable-custom-pages').dragAndDrop(
      '#e2e-content-builder-frame',
      {
        position: 'inside',
      }
    );

    // Add a custom page to the widget via its settings panel
    cy.get('#custom-page-search-input').type(pageTitle);
    cy.contains('[role="option"]', pageTitle, { timeout: 10000 }).click();

    // The widget now renders the selected page in the builder
    cy.get('.e2e-custom-pages-widget').should('exist');

    saveHomepage();

    // Check if widget is displayed in homepage
    goToHomepage();
    cy.get('.e2e-custom-pages-widget').should('exist');
    cy.get('.e2e-custom-page-card').should('contain', pageTitle);

    // Delete widget again
    goToHomepageBuilder();

    cy.get('.e2e-custom-pages-widget').click('top', { force: true });

    cy.get('#e2e-delete-button').click();

    saveHomepage();

    // Make sure it's not on homepage
    goToHomepage();
    cy.get('.e2e-custom-pages-widget').should('not.exist');
  });
});
