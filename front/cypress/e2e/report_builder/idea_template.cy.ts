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
    cy.apiRemoveAllReports();

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
          ideaTitle: higherLikedIdeaTitle,
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

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  describe('Global report builder', () => {
    it('should create an idea template', () => {
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

      // Test that most reacted ideas widget is shown correctly
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

    it('creates a report from a template and allows editing it', () => {
      cy.apiCreateReportBuilder().then((report) => {
        const reportId = report.body.data.id;
        cy.intercept('PATCH', `/web_api/v1/reports/${reportId}`).as(
          'saveReportLayout'
        );

        cy.visit(
          `/admin/reporting/report-builder/${reportId}/editor?templateProjectId=${projectId}`
        );

        cy.wait(2000);

        // Edit text
        cy.get('.e2e-text-box').should('be.visible');
        cy.get('.e2e-text-box').eq(2).click('center');
        cy.get('.ql-editor').click();
        const text = randomString();

        cy.wait(2000);

        cy.get('.ql-editor').clear().type(text, { force: true });

        // Expect this to be visible on screen
        cy.get('.e2e-text-box').eq(2).should('contain.text', text);

        cy.wait(2000);

        // Switch locale
        cy.get('#e2e-locale-select').select('nl-BE');

        // Validate that text for other locale is present
        cy.get('.e2e-text-box')
          .eq(2)
          .should('contain.text', 'Samenvatting van het verslag');

        cy.wait(2000);

        // Switch back
        cy.get('#e2e-locale-select').select('en');

        // Previous edited text should still be there
        cy.get('.e2e-text-box').eq(2).should('contain.text', text);

        // Save report
        cy.get('#e2e-content-builder-topbar-save > button').click({
          force: true,
        });
        cy.wait('@saveReportLayout').then(() => {
          // Refresh page
          cy.reload();

          // Validate that the edited text is still there
          cy.get('.e2e-text-box').should('be.visible');
          cy.get('.e2e-text-box').eq(2).should('contain.text', text);

          // Remove report
          cy.apiRemoveReportBuilder(reportId);
        });
      });
    });
  });

  describe('Phase report builder', () => {
    it('should create an idea template', () => {
      // Create report inside of phase
      cy.visit(`/en/admin/projects/${projectId}/phases/${phaseId}/report`);
      cy.get('#e2e-create-report-button').click();

      // Ensure correct phase selected by default
      cy.get('#e2e-phase-filter').should('have.value', phaseId);

      // Create report from template
      cy.get('div[data-testid="create-report-button"] > button').click();

      // Ensure we are in the editor
      cy.url().should('include', `/en/admin/reporting/report-builder/`);
      cy.url().should('include', `editor?templatePhaseId=${phaseId}`);
      cy.get('#e2e-content-builder-frame').should('exist');

      // Test that most reacted ideas widget is shown correctly
      cy.get('.e2e-report-builder-idea-card').should('have.length', 2);
      cy.get('.e2e-report-builder-idea-card')
        .first()
        .contains(higherLikedIdeaTitle);
      cy.get('.e2e-report-builder-idea-card').last().contains(ideaTitle);

      // Remove report
      cy.visit(`/en/admin/projects/${projectId}/phases/${phaseId}/report`);
      cy.get('#e2e-delete-report-button').click();

      // Ensure we're back to the empty state
      cy.get('#e2e-create-report-button').should('exist');
    });
  });
});
