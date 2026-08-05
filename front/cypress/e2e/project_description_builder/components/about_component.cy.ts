import { randomString } from '../../../support/commands';
import moment = require('moment');

describe('Project description builder About component', () => {
  let projectId = '';
  let projectSlug = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAdminAuthUser().then((user) => {
      const projectTitle = randomString();
      const projectDescriptionPreview = randomString();
      const projectDescription = 'Original project description.';
      const userId = user.body.data.id;

      cy.apiCreateProject({
        title: projectTitle,
        descriptionPreview: projectDescriptionPreview,
        description: projectDescription,
        publicationStatus: 'published',
        assigneeId: userId,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = projectTitle;
        cy.apiToggleProjectDescriptionBuilder({ projectId }).then(() => {
          cy.visit(`/admin/project-page-builder/projects/${projectId}`);
        });
      });
    });
  });
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('handles About component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    cy.get('#e2e-draggable-about-box').dragAndDrop('#e2e-project-page-body', {
      position: 'inside',
    });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');
    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-about-box').should('exist');
  });

  it('deletes About component correctly', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);

    cy.get('#e2e-about-box').click({ force: true });
    cy.get('#e2e-delete-button').click();
    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectDescriptionBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.get('#e2e-about-box').should('not.exist');
  });

  it('displays Take the Survey button on mobile view with native survey phase', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectDescriptionBuilder'
    );

    // Creat a native survey phase for the project
    cy.apiCreateNativeSurveyPhase({
      projectId: projectId,
      title: 'Survey Phase',
      description: 'Survey Phase Description',
      startAt: moment().subtract(1, 'month').format('DD/MM/YYYY'),
      endAt: moment().add(3, 'month').format('DD/MM/YYYY'),
      canPost: true,
      canComment: true,
      canReact: true,
    }).then((survey) => {
      const phaseId = survey.body.data.id;
      cy.visit(`/admin/project-page-builder/projects/${projectId}`);

      // Add about component to the project page
      cy.get('#e2e-draggable-about-box').dragAndDrop('#e2e-project-page-body', {
        position: 'inside',
      });

      cy.get('#e2e-content-builder-topbar-save').click();
      cy.wait('@saveProjectDescriptionBuilder');
      // Check about component is present with take the survey button in project page
      cy.visit(`/projects/${projectSlug}`);
      cy.get('#e2e-about-box').should('exist');
      cy.get('#e2e-about-box').within(() => {
        cy.get('#project-survey-button').should('be.visible');
      });
      // Check about component is present with take the survey button in mobile view
      cy.viewport(375, 667);
      cy.get('#e2e-about-box').should('exist');
      cy.get('#e2e-about-box').within(() => {
        cy.get('#project-survey-button').should('be.visible');
      });
      // back to desktop view
      cy.viewport(1280, 720);
      // Delete about box
      cy.visit(`/admin/project-page-builder/projects/${projectId}`);
      cy.get('#e2e-about-box').click({ force: true });
      cy.get('#e2e-delete-button').click();
      cy.get('#e2e-content-builder-topbar-save').click();
      cy.wait('@saveProjectDescriptionBuilder');
      // Delete native survey phase
      cy.apiRemovePhase(phaseId);
    });
  });
});
