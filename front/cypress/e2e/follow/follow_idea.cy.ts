import { randomString, randomEmail } from '../../support/commands';

describe('Follow idea', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const ideaTitle1 = randomString(40);
  const ideaContent1 = randomString(60);
  const ideaTitle2 = randomString(40);
  const ideaContent2 = randomString(60);
  const projectTitle = randomString();
  let userId: string;
  let ideaId1: string;
  let ideaSlug1: string;
  let ideaId2: string;
  let ideaSlug2: string;
  let projectId: string;
  let projectSlug: string;
  let userSlug: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
      allow_anonymous_participation: true,
      participationMethod: 'ideation',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;

      cy.apiCreateIdea(projectId, ideaTitle1, ideaContent1).then((idea) => {
        ideaId1 = idea.body.data.id;
        ideaSlug1 = idea.body.data.attributes.slug;
      });

      cy.apiCreateIdea(projectId, ideaTitle2, ideaContent2).then((idea) => {
        ideaId2 = idea.body.data.id;
        ideaSlug2 = idea.body.data.attributes.slug;
      });
    });

    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      console.log('response', response);
      userId = response.body.data.id;
      userSlug = response.body.data.attributes.slug;
    });
  });

  after(() => {
    if (userId) {
      cy.apiRemoveUser(userId);
    }
    if (ideaId1) {
      cy.apiRemoveIdea(ideaId1);
    }
    if (ideaId2) {
      cy.apiRemoveIdea(ideaId2);
    }
  });

  it('automatically follows a user after creating an idea and allows user to unfollow it', () => {
    cy.setAdminLoginCookie();

    cy.visit(`/ideas/${ideaSlug1}`);
    cy.acceptCookies();
    cy.get('#e2e-idea-title').contains(ideaTitle1);

    // Shows an unfollow button because the user follows the idea automatically since they created it
    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').should('not.exist');

    // unfollow
    cy.get('[data-cy="e2e-unfollow-button"]').click();

    cy.get('[data-cy="e2e-unfollow-button"]').should('not.exist');
    cy.get('[data-cy="e2e-follow-button"]').should('exist');
  });

  it('shows a follow option to a new user and shows the idea in the activity following page after following where it can be unfollowed', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/ideas/${ideaSlug2}`);
    cy.acceptCookies();
    cy.get('#e2e-idea-title').contains(ideaTitle2);

    // Follow
    cy.get('[data-cy="e2e-follow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').click();

    // Check that it shows unfollow after
    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').should('not.exist');

    cy.visit(`/profile/${userSlug}`);
    cy.get('[data-cy="e2e-following-tab"]').click();
    cy.get('#e2e-user-following-filter-selector').click();

    cy.get('.e2e-sort-items').find('.e2e-sort-item-Idea').click();
    cy.get('.e2e-card-title').contains(ideaTitle2);

    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-unfollow-button"]').click();

    cy.get('.e2e-card-title').should('not.exist');
  });
});
