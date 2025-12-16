import { randomString, randomEmail } from '../../support/commands';
import { signUpEmailConformation, enterUserInfo } from '../../support/auth';

describe('Verification modal', () => {
  describe('shows the additional rules', () => {
    const firstName = randomString();
    const lastName = randomString();
    const email = randomEmail();
    const password = randomString();
    let userId: string;

    describe('verifies a user', () => {
      beforeEach(() => {
        cy.apiSignup(firstName, lastName, email, password)
          .then((user) => {
            userId = user.body.data.id;
          })
          .then(() => {
            cy.setLoginCookie(email, password);
            cy.visit('/profile/edit');
            cy.get('#e2e-user-edit-profile-page').should('exist');
          });
      });

      afterEach(() => {
        cy.apiRemoveUser(userId);
      });

      it('shows the verification modal and successfully verifies the user', () => {
        cy.get('#e2e-verify-user-button').should('exist');
        cy.get('#e2e-verify-user-button').click();
        cy.get('#e2e-verification-wizard-method-selection-step');
        cy.get(
          '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
        ).click();
        cy.get('#e2e-verification-bogus-form');
        cy.get('#e2e-verification-bogus-submit-button').click();
        cy.get('#e2e-verification-success');
        cy.get('#e2e-verification-success-close-button').click();
        cy.get('#e2e-user-edit-profile-page');
        cy.get('.e2e-verified');
        cy.get('#e2e-user-menu-container.e2e-verified');
      });
    });
  });

  describe('Participation with group conditions', () => {
    it('lets you participate if you meet group conditions', () => {
      cy.clearCookies();
      cy.visit('/projects/verified-charlie-poeple-project');
      cy.acceptCookies();

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      // The email should start with charlie, otherwise we won't be
      // in the right group
      signUpEmailConformation(cy, `charlie@${randomString()}.com`);
      enterUserInfo(cy);

      // verification step: fill out bogus
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();

      // continue in success step
      cy.get('#e2e-success-continue-button').click();

      // we should now be redirected to idea form
      cy.location('pathname').should(
        'eq',
        `/en/projects/verified-charlie-poeple-project/ideas/new`
      );
      cy.logout();
    });

    it('does not let you participate if you do not meet group conditions', () => {
      cy.clearCookies();
      cy.visit('/projects/verified-charlie-poeple-project');
      cy.acceptCookies();

      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      // In this case, we just use a random email that does not start with charlie
      // so that we're not in the right group
      signUpEmailConformation(cy);
      enterUserInfo(cy);

      // verification step: fill out bogus
      cy.get(
        '#e2e-verification-wizard-method-selection-step #e2e-bogus-button'
      ).click();
      cy.get('#e2e-verification-bogus-form');
      cy.get('#e2e-verification-bogus-submit-button').click();

      // we should now NOT be redirected to idea form
      cy.location('pathname').should(
        'eq',
        `/en/projects/verified-charlie-poeple-project`
      );

      // button should now be disabled
      cy.get('.e2e-idea-button').first().find('button').should('exist');
      cy.get('.e2e-idea-button')
        .first()
        .find('button')
        .should('have.attr', 'aria-disabled', 'true');
    });
  });
});
