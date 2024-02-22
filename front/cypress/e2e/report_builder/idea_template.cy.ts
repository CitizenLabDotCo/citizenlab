import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

describe('Idea template', () => {
  let projectId: string;
  let phaseId: string;
  let userId: string;

  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  const phaseTitle = randomString();

  const ideaTitle = randomString();
  const ideaContent = randomString();

  const higherLikedIdeaTitle = randomString();

  before(() => {
    cy.setAdminLoginCookie();

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        return cy.apiCreatePhase({
          projectId,
          title: phaseTitle,
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
          allow_anonymous_participation: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
        cy.apiCreateIdea({
          projectId,
          ideaTitle,
          ideaContent,
          phaseIds: [phaseId],
        });
      })
      .then(() => {
        cy.apiCreateIdea({
          projectId,
          ideaTitle: higherVotedIdeaTitle,
          ideaContent,
          phaseIds: [phaseId],
        }).then((idea) => {
          const email = randomEmail();
          const password = randomString();
          cy.apiSignup(randomString(), randomString(), email, password).then(
            (user) => {
              userId = user.body.data.id;
              cy.apiLikeIdea(email, password, idea.body.data.id);
            }
          );
        });
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveUser(userId);
  });

  it('should create an idea template', () => {
    cy.setAdminLoginCookie();

    // Create report from template
    cy.visit(`/admin/reporting/report-builder`);
    cy.get('#e2e-create-report-button').click();

    cy.get('.e2e-create-report-modal-title-input').type(randomString());
    cy.get('#project-template-radio').click({ force: true });
    cy.get('#projectFilter').select(projectId);

    cy.get('div[data-testid="create-report-button"] > button').click();

    // Ensure we are in the editor
    cy.url().should('include', '/en/admin/reporting/report-builder/');
    cy.url().should('include', `editor?templateProjectId=${projectId}`);
    cy.get('#e2e-content-builder-frame').should('exist');

    // TODO actual tests
    cy.get('.e2e-report-builder-idea-card').should('have.length', 2);
    cy.get('.e2e-report-builder-idea-card')
      .first()
      .contains(higherLikedIdeaTitle);
    cy.get('.e2e-report-builder-idea-card').last().contains(ideaTitle);

    // Remove report
    cy.visit('/admin/reporting/report-builder');
    cy.get('#e2e-delete-report-button').click();

    // Ensure we're back to the empty state
    cy.get('#e2e-create-report-button').should('exist');
  });
});
