import { randomString, randomEmail } from '../support/commands';

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

    // shows 6 project cards in the correct layout configuration
    cy.get('.e2e-project-card').should('have.length', 6);
    cy.get('.e2e-project-card').eq(0).should('have.class', 'large');
    cy.get('.e2e-project-card').eq(1).should('have.class', 'medium');
    cy.get('.e2e-project-card').eq(2).should('have.class', 'medium');
    cy.get('.e2e-project-card').eq(3).should('have.class', 'small');
    cy.get('.e2e-project-card').eq(4).should('have.class', 'small');
    cy.get('.e2e-project-card').eq(5).should('have.class', 'small');

    // shows a "show more" button underneath the project cards
    cy.get('.e2e-project-cards-show-more-button');

    // shows the signed-out header CTA button, and redirects to /sign-up when clicked'
    cy.get('.e2e-signed-out-header-cta-button').click();
    cy.location('pathname').should('eq', '/en-GB/sign-up');
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
      cy.login(email, password);
      cy.goToLandingPage();
    });
  });

  it('shows correct content', () => {
    // shows the "complete your profile" header by default
    cy.get('.e2e-signed-in-header').get('#e2e-singed-in-header-complete-profile');

    // have a "Complete your profile" button that links to the profile page
    cy.get('#e2e-singed-in-header-complete-profile .e2e-singed-in-header-accept-btn a').should('have.attr', 'href').and('include', '/en-GB/profile/edit');

    // shows the "custom CTA" header when skipping the "complete your profile" header
    cy.get('#e2e-singed-in-header-complete-profile').get('.e2e-singed-in-header-skip-btn').click();
    cy.wait(1000);
    cy.get('#e2e-singed-in-header-default-cta');
  });

  after(() => {
    cy.apiRemoveUser(userId);
  });
});
