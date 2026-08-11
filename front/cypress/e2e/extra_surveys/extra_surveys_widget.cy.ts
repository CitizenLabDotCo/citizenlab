import moment = require('moment');

import { randomString } from '../../support/commands';

describe('Extra surveys widget in the project page builder', () => {
  const surveyTitle = randomString();
  const surveyDescription = 'Tell us how we can improve the city parks.';
  let projectId = '';
  let projectSlug = '';
  let surveyPhaseId = '';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAdminAuthUser().then((user) => {
      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
        assigneeId: user.body.data.id,
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;

        cy.apiCreateNativeSurveyPhase({
          projectId,
          title: surveyTitle,
          startAt: moment().subtract(1, 'month').format('DD/MM/YYYY'),
          description: surveyDescription,
          placementType: 'standalone',
        }).then((phase) => {
          surveyPhaseId = phase.body.data.id;
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

  it('adds the widget, links a survey and renders the survey card on the project page', () => {
    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectPage'
    );
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);

    cy.get('#e2e-draggable-extra-surveys').dragAndDrop(
      '#e2e-project-page-body',
      {
        position: 'inside',
      }
    );

    // Until a survey is linked the widget shows an editor-only empty state
    cy.contains('No survey linked yet').should('exist');

    // Select the widget and link the standalone survey from the settings panel
    cy.contains('No survey linked yet').click({ force: true });
    cy.get('#e2e-extra-surveys-survey-select').select(surveyTitle);

    // The editor now previews the survey card instead of the empty state
    cy.contains('No survey linked yet').should('not.exist');
    cy.contains(surveyTitle).should('exist');

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectPage');

    // The project page renders the card with the survey details and CTA
    cy.visit(`/projects/${projectSlug}`);
    cy.contains(surveyTitle).should('exist');
    cy.contains(surveyDescription).should('exist');
    cy.get('.e2e-extra-survey-button')
      .should('exist')
      .and('contain', 'Take the survey');
  });

  it('navigates to the linked survey form when the card CTA is clicked', () => {
    cy.visit(`/projects/${projectSlug}`);

    cy.get('.e2e-extra-survey-button')
      .first()
      .find('a, button')
      .first()
      .click({ force: true });

    cy.url().should('include', `/projects/${projectSlug}/surveys/new`);
    cy.url().should('include', `phase_id=${surveyPhaseId}`);
  });

  it('supports the plain button format with custom button text', () => {
    const customButtonText = 'Give your feedback';

    cy.intercept('**/content_builder_layouts/project_page/upsert').as(
      'saveProjectPage'
    );
    cy.visit(`/admin/project-page-builder/projects/${projectId}`);

    // Select the widget by clicking its rendered button
    cy.get('.e2e-extra-survey-button').first().click({ force: true });

    cy.get('#extra-surveys-format-button').click({ force: true });
    cy.get('#e2e-extra-surveys-button-text').type(customButtonText, {
      force: true,
    });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveProjectPage');

    // The project page now renders a plain button with the custom text, and
    // the card content (title and description) is gone
    cy.visit(`/projects/${projectSlug}`);
    cy.get('.e2e-extra-survey-button').should('contain', customButtonText);
    cy.contains(surveyTitle).should('not.exist');
    cy.contains(surveyDescription).should('not.exist');
  });
});
