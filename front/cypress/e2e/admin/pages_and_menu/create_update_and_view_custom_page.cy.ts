import { randomString } from '../../../support/commands';

describe('Admin: can', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit('/admin/pages-menu/pages');
  });

  describe('create', () => {
    const page1 = randomString(4);
    let customPageId1: string;

    after(() => {
      if (customPageId1) {
        cy.apiRemoveCustomPage(customPageId1);
      }
    });

    it('and view a custom page successfully', () => {
      cy.intercept('POST', '**/static_pages').as('createCustomPage');

      cy.visit('/admin/pages-menu/pages');

      // go to custom page creation form
      cy.get('#create-custom-page').click();

      // type title in each language
      cy.clickLocaleSwitcherAndType(page1);

      // submit
      cy.dataCy('e2e-submit-custom-page').click();

      cy.wait('@createCustomPage').then((interception) => {
        customPageId1 = interception.response?.body.data.id;
      });

      // visit our custom page by slug
      cy.visit(`/en/pages/${page1}`);
      cy.contains(page1).should('exist');
    });
  });
});
