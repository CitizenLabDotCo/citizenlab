import { randomString, randomEmail } from '../../support/commands';

describe('Follow project', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const projectTitle1 = randomString();
  const projectTitle2 = randomString();
  let userId: string;
  let projectId1: string;
  let projectSlug1: string;
  let projectId2: string;
  let projectSlug2: string;
  let userSlug: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle1,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
      allow_anonymous_participation: true,
      participationMethod: 'ideation',
    }).then((project) => {
      projectId1 = project.body.data.id;
      projectSlug1 = project.body.data.attributes.slug;
    });

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle2,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
      allow_anonymous_participation: true,
      participationMethod: 'ideation',
    }).then((project) => {
      projectId2 = project.body.data.id;
      projectSlug2 = project.body.data.attributes.slug;
    });

    cy.apiSignup(firstName, lastName, email, password).then((response) => {
      userId = response.body.data.id;
      userSlug = response.body.data.attributes.slug;
    });
  });

  after(() => {
    if (userId) {
      cy.apiRemoveUser(userId);
    }
    if (projectId1) {
      cy.apiRemoveProject(projectId1);
    }
    if (projectId2) {
      cy.apiRemoveProject(projectId2);
    }
  });

  it('shows a follow option to a new user and shows the project in the activity following page after following where it can be unfollowed', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/projects/${projectSlug2}`);
    cy.acceptCookies();
    cy.get('#e2e-project-page').contains(projectTitle2);

    // Follow
    cy.get('[data-cy="e2e-follow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').click();

    // Check that it shows unfollow after
    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-follow-button"]').should('not.exist');

    cy.visit(`/profile/${userSlug}`);
    cy.get('[data-cy="e2e-following-tab"]').click();
    cy.get('#e2e-user-following-filter-selector').click();

    cy.get('.e2e-sort-items').find('.e2e-sort-item-Project').click();
    cy.get('.e2e-project-card-project-title').contains(projectTitle2);

    cy.get('[data-cy="e2e-unfollow-button"]').should('exist');
    cy.get('[data-cy="e2e-unfollow-button"]').click();

    cy.get('.e2e-project-card-project-title').should('not.exist');
  });
});
