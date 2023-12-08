import { randomString } from '../support/commands';
import moment = require('moment');

describe('Idea creation', () => {
  const projectTitle = randomString();
  const description = randomString();
  let projectId: string;
  let phaseId: string;
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
        phaseId = phase.body.data.id;
      });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  it('allows the admin to add an idea to an old phase', () => {
    const newIdeaTitle = randomString(40);

    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/ideas`);
    cy.get('#e2e-new-idea').click();

    cy.get('#e2e-idea-new-page');
    cy.get('#idea-form');
    cy.contains('Add new idea').should('exist');

    // The next line was flaky on CI where the "type" command resulted in skipped letters
    // Seems to be a known problem, and one solution is to type then clear to "warm up" Cypress
    // Related: https://github.com/cypress-io/cypress/issues/3817
    cy.get('#e2e-idea-title-input input').type('x');
    cy.get('#e2e-idea-title-input input').clear();
    cy.get('#e2e-idea-title-input input').type(`${newIdeaTitle}`);
    cy.get('#e2e-idea-description-input .ql-editor').type(newIdeaContent);

    // verify that image and file upload components are present
    cy.get('#e2e-idea-image-upload').should('exist');
    cy.get('#e2e-idea-file-upload').should('exist');

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(4).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker')
      .find('button.selected')
      .should('have.length', 1);

    // add a location
    cy.get('.e2e-idea-form-location-input-field input').type(
      'Boulevard Anspach Brussels'
    );

    // wait for the autocomplete to appear. Waiting for the api call doesn't seem to be enough but doing this for now
    cy.wait(10000);

    cy.get('.e2e-idea-form-location-input-field input').type(
      '{downArrow}{enter}'
    );

    cy.get('.e2e-idea-form-location-input-field input');

    // save the form
    cy.get('.e2e-submit-idea-form').click();
    cy.wait(3000);

    // verify the content of the newly created idea page
    cy.location('pathname').should('eq', `/en/ideas/${newIdeaTitle}`);

    cy.visit(`/en/projects/${projectSlug}`);
    cy.get('.e2e-previous-phase').click();

    // the card should contain the title
    cy.get('.e2e-idea-card-title').contains(newIdeaTitle);
  });
});
