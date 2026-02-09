import { logIn, signUpEmailConformation } from '../../support/auth';
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

        cy.apiSetPhasePermission({
          phaseId,
          permissionBody: {
            permitted_by: 'everyone_confirmed_email',
          },
          action: 'posting_idea',
        });
      });
  });

  it('works when signing up with new email', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });

  it('works when signing up with existing normal user', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    logIn(cy, 'admin@govocal.com', 'democracy2.0');

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
