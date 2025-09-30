import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Admin reset project participation data', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  const ideationIdeaTitle = randomString();
  const votingIdeaTitle = randomString();

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      // Create ideation phase
      cy.apiCreatePhase({
        projectId,
        title: 'ideation',
        startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
        endAt: moment().subtract(6, 'month').format('DD/MM/YYYY'),
        participationMethod: 'ideation',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateIdea({
          projectId,
          phaseIds: [phase.body.data.id],
          ideaTitle: ideationIdeaTitle,
          ideaContent: randomString(),
        });
      });

      // Create voting phase
      cy.apiCreatePhase({
        projectId,
        title: 'voting',
        startAt: moment().subtract(5, 'month').format('DD/MM/YYYY'),
        participationMethod: 'voting',
        votingMethod: 'single_voting',
        canPost: true,
        canComment: true,
        canReact: true,
      }).then((phase) => {
        cy.apiCreateIdea({
          projectId,
          phaseIds: [phase.body.data.id],
          ideaTitle: votingIdeaTitle,
          ideaContent: randomString(),
        });
      });
    });
  });

  it('should reset project participation data', () => {
    cy.setAdminLoginCookie();
    cy.visit(`/projects/${projectSlug}/1`);
    cy.get('.e2e-idea-card').should('contain', ideationIdeaTitle);
    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-idea-card').should('contain', votingIdeaTitle);

    // Vote on the idea in the voting phase
    cy.get('.e2e-single-vote-button').click();
    cy.get('#e2e-voting-submit-button').click();
    cy.get('.e2e-single-vote-button').should('contain', 'Selected');

    // Reset project participation data
    cy.visit(`/admin/projects/${projectId}/general/data`);
    cy.get('#e2e-reset-participation-data').click();
    cy.get('#e2e-reset-participation-data-yes').click();

    // Check if the participation data has been reset
    cy.visit(`/projects/${projectSlug}/1`);

    // Ideas in the ideation phase are removed
    cy.get('.e2e-idea-card').should('not.exist');
    cy.visit(`/projects/${projectSlug}`);

    // Voting options do not get removed but the votes are removed
    cy.get('.e2e-idea-card').should('contain', votingIdeaTitle);
    cy.get('.e2e-single-vote-button').should('contain', 'Select');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
