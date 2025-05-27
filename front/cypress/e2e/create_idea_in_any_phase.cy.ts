import { randomString } from '../support/commands';
import moment = require('moment');

describe('Idea creation', () => {
  const projectTitle = randomString();
  const description = randomString();
  let projectId: string;
  let firstPhaseId: string;
  let projectSlug: string;
  const newIdeaContent = randomString(60);
  const newIdeaTitle = randomString(10);

  beforeEach(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: description,
      description,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        cy.apiCreatePhase({
          projectId,
          title: 'secondPhaseTitle',
          startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(1, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canReact: true,
          canComment: true,
        });

        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        firstPhaseId = phase.body.data.id;
        cy.setAdminLoginCookie();
      });
  });

  it('allows the admin to add an idea to an old phase', () => {
    cy.visit(`admin/projects/${projectId}/phases/${firstPhaseId}/ideas`);
    cy.acceptCookies();
    cy.get('#e2e-new-idea').click();

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // The next line was flaky on CI where the "type" command resulted in skipped letters
    // Seems to be a known problem, and one solution is to type then clear to "warm up" Cypress
    // Related: https://github.com/cypress-io/cypress/issues/3817
    cy.get('#e2e-idea-title-input input').type('x', { delay: 0 });
    cy.get('#e2e-idea-title-input input').clear();
    cy.get('#e2e-idea-title-input input').type(`${newIdeaTitle}`, { delay: 0 });

    cy.dataCy('e2e-next-page').should('be.visible').click();

    cy.get('#e2e-idea-description-input .ql-editor').type(newIdeaContent, {
      delay: 0,
    });
    cy.wait(500);

    // Go to the next page of the idea form
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Go to the third page of the idea form that should have the topics picker
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click({ force: true });

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // save the form
    cy.dataCy('e2e-submit-form').click();
    cy.wait(3000);

    cy.dataCy('e2e-after-submission').should('exist');
    cy.dataCy('e2e-after-submission').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${newIdeaTitle}`);
    cy.get('#e2e-idea-title').contains(newIdeaTitle);

    cy.visit(`admin/projects/${projectId}/phases/${firstPhaseId}/ideas`);
    cy.get('.e2e-idea-manager-idea-row').first().contains(newIdeaTitle);
  });
});
