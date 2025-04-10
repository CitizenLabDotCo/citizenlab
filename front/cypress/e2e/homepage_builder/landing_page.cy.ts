import { randomString, randomEmail } from '../../support/commands';

describe('Landing page - not signed in', () => {
  beforeEach(() => {
    cy.goToLandingPage();
  });

  it('shows the correct content', () => {
    // shows the page
    cy.get('#e2e-landing-page');

    // shows the project section
    cy.get('#e2e-landing-page-project-section');

    // shows the signed-out header
    cy.get('.e2e-signed-out-header');

    // shows the signed-out header title
    cy.get('.e2e-signed-out-header-title');

    // shows the signed-out header subtitle
    cy.get('.e2e-signed-out-header-subtitle');

    // has only one active tab
    cy.get('.e2e-projects-list.active-tab').should('have.length', 1);

    // shows 6 project cards in the correct layout configuration
    cy.get(
      '.e2e-projects-list.active-tab > .e2e-admin-publication-card'
    ).should('have.length', 6);
    cy.get('.e2e-projects-list.active-tab > .e2e-admin-publication-card')
      .eq(0)
      .should('have.class', 'large');
    cy.get('.e2e-projects-list.active-tab > .e2e-admin-publication-card')
      .eq(1)
      .should('have.class', 'medium');
    cy.get('.e2e-projects-list.active-tab > .e2e-admin-publication-card')
      .eq(2)
      .should('have.class', 'medium');
    cy.get('.e2e-projects-list.active-tab > .e2e-admin-publication-card')
      .eq(3)
      .should('have.class', 'small');
    cy.get('.e2e-projects-list.active-tab > .e2e-admin-publication-card')
      .eq(4)
      .should('have.class', 'small');
    cy.get('.e2e-projects-list.active-tab > .e2e-admin-publication-card')
      .eq(5)
      .should('have.class', 'small');

    // shows a "show more" button underneath the project cards
    cy.get('.e2e-project-cards-show-more-button');

    // is accessible
    cy.injectAxe();
    cy.checkA11y();

    // shows the signed-out header CTA button, and shows the sign up/in modal when clicked
    cy.get('.e2e-signed-out-header-cta-button').click();
    cy.get('#e2e-authentication-modal');
  });
});

describe('Landing page - URL sign in/up', () => {
  it('shows correct authentication modal when logged out', () => {
    cy.clearCookies();
    cy.visit('/sign-in');
    cy.get('#e2e-authentication-modal').should('exist');
    cy.contains('Log in').should('exist');

    cy.visit('/sign-up');
    cy.get('#e2e-authentication-modal').should('exist');
    cy.contains('Sign up').should('exist');
  });

  it('shows no authentication modal when already logged in', () => {
    cy.setAdminLoginCookie();
    cy.visit('/sign-up');
    cy.get('#e2e-authentication-modal').should('not.exist');
    cy.visit('/sign-in');
    cy.get('#e2e-authentication-modal').should('not.exist');
  });
});

describe('Landing page - signed in', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((user) => {
      userId = user.body.data.id;
      cy.setLoginCookie(email, password);
    });
  });

  it('shows correct content', () => {
    cy.goToLandingPage();
    cy.wait(2000);
    // shows the "complete your profile" header by default
    cy.get('.e2e-signed-in-header');
    cy.get(
      '#e2e-signed-in-header-verification .e2e-signed-in-header-accept-btn'
    ).click();
    cy.get('#e2e-verification-wizard-root');
    cy.get('.e2e-modal-close-button').click();
    cy.get(
      '#e2e-signed-in-header-verification .e2e-signed-in-header-verification-skip-btn'
    ).click();
    cy.get(
      '#e2e-signed-in-header-complete-profile .e2e-signed-in-header-accept-btn a'
    )
      .should('have.attr', 'href')
      .and('include', '/en/profile/edit');

    // shows the "custom CTA" header when skipping the "complete your profile" header
    cy.get('#e2e-signed-in-header-complete-profile')
      .get('.e2e-signed-in-header-complete-skip-btn')
      .click();
    cy.wait(1000);
    const signedInHeaderEnglish = /is listening to you/gi;
    cy.get('#e2e-signed-in-header-default-cta').should(($el) => {
      const text = $el.text();
      expect(text).to.match(signedInHeaderEnglish);
    });

    // Is accessible
    cy.injectAxe();
    cy.checkA11y();
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });
});
