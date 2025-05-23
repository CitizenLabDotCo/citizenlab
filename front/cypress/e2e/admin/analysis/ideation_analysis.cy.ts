import { randomString } from '../../../support/commands';
import moment = require('moment');

let projectId = '';
let phaseId: string;
describe('Admin: ideation analysis', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
  before(() => {
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project?.body.data.id;

      return cy
        .apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        })
        .then((phase) => {
          phaseId = phase.body.data.id;
          const ideaTitle1 = 'My first idea';
          const ideaTitle2 = 'My second idea';
          const ideaTitle3 = 'My third idea';

          const ideaContent = randomString();
          cy.apiCreateIdea({
            projectId,
            ideaTitle: ideaTitle1,
            ideaContent: ideaContent,
            phaseIds: [phaseId],
          }).then((idea) => {
            cy.apiAddComment(idea.body.data.id, 'The first comment');
          });
          cy.apiCreateIdea({
            projectId,
            ideaTitle: ideaTitle2,
            ideaContent: ideaContent,
            phaseIds: [phaseId],
          });
          cy.apiCreateIdea({
            projectId,
            ideaTitle: ideaTitle3,
            ideaContent: ideaContent,
            phaseIds: [phaseId],
          });
        });
    });
  });

  it('creates an analysis from an ideation entry point', () => {
    cy.intercept('GET', '**/insights', {
      fixture: 'analysis_insights_ideation.json',
    });

    cy.visit('/admin/projects/' + projectId + '/ideas');
    cy.visit(`admin/projects/${projectId}/phases/${phaseId}/ideas`);
    cy.get('#e2e-analysis-banner-button').click();

    cy.location('pathname').should(
      'include',
      '/en/admin/projects/' + projectId + '/analysis'
    );

    // Launch modal
    cy.get('#e2e-analysis-launch-modal').should('exist');
    cy.get('#e2e-analysis-launch-modal-agree-button').click();

    // Shows insights
    cy.dataCy('e2e-analysis-summary').should('exist');

    // Searches inputs correctly
    cy.dataCy('e2e-analysis-input-item').should('have.length', 3);
    cy.get('#search-input').type('first');
    cy.dataCy('e2e-analysis-input-item').should('have.length', 1);
    cy.get('#search-input').clear();
    cy.dataCy('e2e-analysis-input-item').should('have.length', 3);

    // Preview inputs correctly
    cy.dataCy('e2e-analysis-input-preview').should('contain', 'My first idea');
    // Shows comments
    cy.dataCy('e2e-analysis-input-preview').should(
      'contain',
      'The first comment'
    );
    cy.dataCy('e2e-analysis-input-item').last().click();
    cy.dataCy('e2e-analysis-input-preview').should('contain', 'My third idea');

    // Works with manual tags
    // Has two tags by default e2e-analysis-tag
    cy.dataCy('e2e-analysis-tag-container').should('have.length', 2);

    // Add a tag e2e-analysis-add-tag-input
    cy.get('#e2e-analysis-add-tag-input').type('My new tag');
    cy.get('#e2e-analysis-add-tag-button').click();
    cy.dataCy('e2e-analysis-tag-container').should('have.length', 3);

    // Adds a tagging to input
    cy.dataCy('e2e-analysis-input-item').first().click();
    cy.dataCy('e2e-analysis-input-preview')
      .find('[data-cy="e2e-analysis-tag"]')
      .contains('My new tag')
      .click();
    cy.dataCy('e2e-analysis-input-item')
      .first()
      .should('contain', 'My new tag');

    // Filters input on tag selection
    cy.dataCy('e2e-analysis-tag').contains('My new tag').click();
    cy.dataCy('e2e-analysis-input-item').should('have.length', 1);

    // Filters on input without tags
    cy.dataCy('e2e-analysis-inputs-without-tags').click();
    cy.dataCy('e2e-analysis-input-item').should('have.length', 2);

    // All input
    cy.dataCy('e2e-analysis-all-tags').click();
    cy.dataCy('e2e-analysis-input-item').should('have.length', 3);

    // Delete a tag
    cy.dataCy('e2e-analysis-tag-action').first().click();
    cy.get('#e2e-analysis-delete-tag-button').click();
    cy.on('window:confirm', () => true);
    cy.dataCy('e2e-analysis-tag-container').should('have.length', 2);
    cy.dataCy('e2e-analysis-input-preview').should('not.contain', 'My new tag');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
