import { randomString } from '../support/commands';
import moment = require('moment');

describe('Idea creation', () => {
  const projectTitle = randomString();
  const description = randomString();
  let projectId: string;
  let firstPhaseId: string;
  let projectSlug: string;
  const newIdeaContent = randomString(60);

  before(() => {
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
      });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('allows the admin to add an idea to an old phase', () => {
    const newIdeaTitle = randomString(40);

    cy.visit(`admin/projects/${projectId}/phases/${firstPhaseId}/ideas`);
    cy.acceptCookies();
    cy.get('#e2e-new-idea').click();

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    cy.get('#e2e-idea-title-input input')
      .click()
      .type(`${newIdeaTitle}`, { delay: 0 });
    cy.get('#e2e-idea-description-input .ql-editor').type(newIdeaContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click({ force: true });

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // save the form
    cy.get('.e2e-submit-idea-form').click();

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${newIdeaTitle}`);
    cy.get('#e2e-idea-title').contains(newIdeaTitle);

    cy.visit(`admin/projects/${projectId}/phases/${firstPhaseId}/ideas`);
    cy.get('.e2e-idea-manager-idea-row').first().contains(newIdeaTitle);
  });
});
