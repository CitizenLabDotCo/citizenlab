import { randomString, randomEmail } from '../../support/commands';
import moment = require('moment');

describe('Light authentication flow', () => {
  let projectId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();
  let phaseId: string;

  before(() => {
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
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;

        cy.intercept(`**/phases/${phaseId}/permissions/posting_idea`).as(
          'setPermissionRequest'
        );

        cy.setAdminLoginCookie();
        cy.visit(
          `/admin/projects/${projectId}/phases/${phaseId}/access-rights`
        );

        cy.get('.e2e-action-accordion-posting_idea').click();
        cy.get('.e2e-action-form-posting_idea').within(() => {
          cy.get('.e2e-permission-email-confirmed-users').click();
        });

        cy.wait('@setPermissionRequest').then(() => {
          cy.logout();
        });
      });
  });

  it('works when signing up with new email', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').find('button').should('exist');
    cy.get('.e2e-idea-button').find('button').click({ force: true });

    cy.get('input#email').focus().type(randomEmail());
    cy.get('#e2e-light-flow-email-submit').click();

    cy.get('#e2e-terms-conditions-container .e2e-checkbox').click();
    cy.get('#e2e-privacy-policy-container .e2e-checkbox').click();
    cy.get('#e2e-policies-continue').click();

    cy.get('input#code').focus().type('1234');
    cy.get('#e2e-verify-email-button').click();

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  it('works when signing up with existing normal user', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').find('button').should('exist');
    cy.get('.e2e-idea-button').find('button').click({ force: true });

    cy.get('input#email').focus().type('admin@govocal.com');
    cy.get('#e2e-light-flow-email-submit').click();

    cy.get('input#password').type('democracy2.0');
    cy.get('#e2e-light-flow-password-submit').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
