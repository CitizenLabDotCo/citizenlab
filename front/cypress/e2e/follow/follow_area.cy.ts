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

  it('allows a user to follow and unfollow an area', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/profile/${userSlug}/following`);
    cy.acceptCookies();

    cy.get('#tab-Areas').click();

    // Follow the first area
    cy.dataCy('e2e-follow-area-button').should('exist');
    cy.dataCy('e2e-follow-area-button').eq(0).click();

    // Unfollow the area
    cy.dataCy('e2e-unfollow-area-button').should('exist');
    cy.dataCy('e2e-unfollow-area-button').eq(0).click();

    cy.dataCy('e2e-unfollow-area-button').should('not.exist');
    cy.dataCy('e2e-follow-area-button').should('exist');
  });
});
