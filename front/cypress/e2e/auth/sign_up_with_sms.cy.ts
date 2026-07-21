import { signUpEmailConformation, enterUserInfo } from '../../support/auth';
import { randomPhoneNumber, randomString } from '../../support/commands';
import moment = require('moment');

describe('Sign up - email and SMS (2FA)', () => {
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
            permitted_by: 'users',
            require_confirmed_phone_number: true,
          },
          action: 'posting_idea',
        });
      });
  });

  it('works when signing up with new phone number', () => {
    cy.visit(`/projects/${projectTitle}`);

    cy.get('.e2e-idea-button').first().find('button').should('exist');
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    signUpEmailConformation(cy);

    // Enter phone number
    cy.dataCy('phone-number-input').find('input').type(randomPhoneNumber());
    cy.dataCy('phone-continue-button').click();

    // Confirm phone number
    cy.dataCy('phone-code-input').find('input').type('1234');
    cy.dataCy('phone-confirm-button').click();

    enterUserInfo(cy);

    cy.get('#e2e-success-continue-button').click();

    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectTitle}/surveys/new`
    );
    cy.logout();
  });
});
