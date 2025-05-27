import { randomString } from '../../support/commands';
import moment = require('moment');

describe('New default widgets', () => {
  // Create a new project with an active ideation phase
  const projectTitle = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: randomString(),
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      return cy.apiCreatePhase({
        projectId,
        title: 'firstPhaseTitle',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        endAt: moment().add(1, 'day').format('DD/MM/YYYY'),
        participationMethod: 'ideation',
        canPost: true,
        canComment: true,
        canReact: true,
      });
    });
  });

  it('has the "Open to participation" widget', () => {
    cy.goToLandingPage();
    cy.get('.e2e-open-to-participation').should('exist');
  });

  it('has the "Finished projects" widget', () => {
    cy.goToLandingPage();
    cy.get('.e2e-finished-or-archived').should('exist');
  });

  it('should show followed project in the "For you" widget', () => {
    cy.setAdminLoginCookie();

    // Go to project
    cy.visit(`/en/projects/${projectSlug}`);
    cy.get('#e2e-project-page').should('exist');

    // Follow the project
    cy.dataCy('e2e-follow-button').click();
    cy.dataCy('e2e-unfollow-button').should('exist');

    // Go back to landing page
    cy.goToLandingPage();

    // Followed project should show up in 'for you' widget
    const widget = cy.get('.e2e-followed-items');
    widget.should('exist');
    widget
      .get('[data-cy="e2e-light-project-card"]')
      .first()
      .should('contain', projectTitle);

    // Log out, make sure widget is now gone
    cy.logout();
    cy.reload();
    cy.wait(5000);
    cy.get('.e2e-followed-items').should('not.exist');

    // Clean up
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });
});
