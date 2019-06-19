import { randomString, randomEmail } from '../support/commands';

describe('Landing page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(1000);
  });

  it('shows the page', () => {
    cy.get('#e2e-landing-page');
  });

  it('shows the project section', () => {
    cy.get('#e2e-landing-page-project-section');
  });

  describe('Signed out header', () => {
    it('shows the signed-out header when not logged in', () => {
      cy.get('.e2e-signed-out-header');
    });

    it('shows the signed-out header title', () => {
      cy.get('.e2e-signed-out-header-title');
    });

    it('shows the signed-out header subtitle', () => {
      cy.get('.e2e-signed-out-header-subtitle');
    });

    it('shows the signed-out header CTA button, and redirects to /sign-up when clicked', () => {
      cy.get('.e2e-signed-out-header-cta-button').click();
      cy.location('pathname').should('eq', '/en-GB/sign-up');
    });
  });

  describe('Signed in header', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let userId: string;

    before(() => {
      cy.apiSignup(firstName, lastName, email, password).then(userResponse => {
        userId = userResponse.body.data.id;
      });
    });
    beforeEach(() => {
      cy.login(email, password);
      cy.visit('/');
      cy.wait(1000);
    });

    it('shows the "complete your profile" header by default', () => {
      cy.get('.e2e-signed-in-header').get('#e2e-singed-in-header-complete-profile');
    });

    it('navigates to the edit profile page when clicking the "Complete your profile" button', () => {
      cy.get('#e2e-singed-in-header-complete-profile').get('.e2e-singed-in-header-accept-btn').click();
      cy.location('pathname').should('eq', '/en-GB/profile/edit');
    });

    it('shows the "custom CTA" header when skipping the "complete your profile" header', () => {
      cy.get('#e2e-singed-in-header-complete-profile').get('.e2e-singed-in-header-skip-btn').click();
      cy.wait(1000);
      cy.get('#e2e-singed-in-header-default-cta');
    });

    after(() => {
      cy.apiRemoveUser(userId);
    });
  });

  it('shows 6 project cards in the correct layout configuration', () => {
    cy.get('.e2e-project-card').should('have.length', 6);
    cy.get('.e2e-project-card').eq(0).should('have.class', 'large');
    cy.get('.e2e-project-card').eq(1).should('have.class', 'medium');
    cy.get('.e2e-project-card').eq(2).should('have.class', 'medium');
    cy.get('.e2e-project-card').eq(3).should('have.class', 'small');
    cy.get('.e2e-project-card').eq(4).should('have.class', 'small');
    cy.get('.e2e-project-card').eq(5).should('have.class', 'small');
  });

  it('shows a "show more" button underneath the project cards', () => {
    cy.get('.e2e-project-cards-show-more-button');
  });
});
