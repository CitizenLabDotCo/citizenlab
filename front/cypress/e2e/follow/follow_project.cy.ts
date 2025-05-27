import { randomString, randomEmail } from '../../support/commands';

describe('Follow project', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const projectTitle = randomString();
  let userId: string;
  let projectId: string;
  let projectSlug: string;
  let userSlug: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: '',
      description: '',
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
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
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  it('shows a follow option and an unfollow option after following', () => {
    cy.setLoginCookie(email, password);

    cy.visit(`/projects/${projectSlug}`);
    cy.acceptCookies();
    cy.get('#e2e-project-page').contains(projectTitle);

    // Follow
    cy.dataCy('e2e-follow-button').should('exist');
    cy.dataCy('e2e-follow-button').click();

    // Check that it shows unfollow after
    cy.dataCy('e2e-unfollow-button').should('exist');
    cy.dataCy('e2e-follow-button').should('not.exist');
  });
});
