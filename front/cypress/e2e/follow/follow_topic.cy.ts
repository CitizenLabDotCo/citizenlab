import { randomString, randomEmail } from '../../support/commands';

describe('Follow topic', () => {
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

  it('allows a user to follow and unfollow a topic', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/profile/${userSlug}/following`);
    cy.acceptCookies();
    cy.get('#tab-Topics').click();

    // Follow the first topic
    cy.dataCy('e2e-follow-topic-button').should('exist');
    cy.dataCy('e2e-follow-topic-button').eq(0).click();

    // Unfollow the topic
    cy.dataCy('e2e-unfollow-topic-button').should('exist');
    cy.dataCy('e2e-unfollow-topic-button').eq(0).click();

    cy.dataCy('e2e-unfollow-topic-button').should('not.exist');
    cy.dataCy('e2e-follow-topic-button').should('exist');
  });
});
