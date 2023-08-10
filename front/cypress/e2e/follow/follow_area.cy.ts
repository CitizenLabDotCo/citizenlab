import { randomString, randomEmail } from '../../support/commands';

describe('Follow area', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  let userId: string;
  let userSlug: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
      userSlug = response.body.data.attributes.slug;
    });
  });

  after(() => {
    if (userId) {
      cy.apiRemoveUser(userId);
    }
  });

  it('allows a user to follow and unfollow a area', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/profile/${userSlug}`);
    cy.acceptCookies();
    cy.get('[data-cy="e2e-following-tab"]').click();
    cy.get('#e2e-user-following-filter-selector').click();

    cy.get('.e2e-sort-items').find('.e2e-sort-item-Areas').click();

    // Follow the first area
    cy.get('[data-cy="e2e-follow-area-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-area-button"]').eq(0).click();

    // Unfollow the area
    cy.get('[data-cy="e2e-unfollow-area-button"]').should('exist');
    cy.get('[data-cy="e2e-unfollow-area-button"]').eq(0).click();

    cy.get('[data-cy="e2e-unfollow-area-button"]').should('not.exist');
    cy.get('[data-cy="e2e-follow-area-button"]').should('exist');
  });
});
