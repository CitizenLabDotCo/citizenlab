import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';
import {
  updatePermission,
  confirmUserCustomFieldHasValue,
  addPermissionsCustomField,
} from '../../support/permitted_by_utils';

describe('Native survey permitted by: everyone', () => {
  let customFieldId = '';
  let customFieldKey = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';
  let userId: string | undefined;
  let answer: string | undefined;

  const fieldName = randomString(10);

  const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  before(() => {
    // Create custom field
    cy.apiCreateCustomField(fieldName, true, false).then((response) => {
      customFieldId = response.body.data.id;
      customFieldKey = response.body.data.attributes.key;

      // Create project with active native survey phase
      cy.apiCreateProject({
        title: randomString(),
        descriptionPreview: randomString(),
        description: randomString(),
        publicationStatus: 'published',
      }).then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        cy.apiCreatePhase({
          projectId,
          title: randomString(),
          startAt: twoDaysAgo,
          endAt: inTwoMonths,
          participationMethod: 'native_survey',
          nativeSurveyButtonMultiloc: { en: 'Take the survey' },
          nativeSurveyTitleMultiloc: { en: 'Survey' },
          canComment: true,
          canPost: true,
          canReact: true,
          description: 'Some description',
        }).then((phase) => {
          phaseId = phase.body.data.id;

          // Set permission to everyone
          return cy
            .apiLogin('admin@govocal.com', 'democracy2.0')
            .then((response) => {
              const adminJwt = response.body.jwt;

              return updatePermission({
                adminJwt,
                phaseId,
                permitted_by: 'everyone',
                user_fields_in_form: true,
                user_data_collection: 'all_data',
              }).then(() => {
                // Add one permissions custom field
                return addPermissionsCustomField(cy, {
                  adminJwt,
                  phaseId,
                  customFieldId,
                });
              });
            });
        });
      });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveCustomField(customFieldId);

    if (userId) {
      cy.apiRemoveUser(userId);
    }
  });

  const confirmSavedToProfile = () => {
    confirmUserCustomFieldHasValue(cy, { key: customFieldKey, value: answer });
  };

  describe('As a visitor', () => {
    const fieldsInSurvey = () => {
      cy.visit(`/projects/${projectSlug}`);

      // Click take survey button
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      // Confirm we're in the survey now
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/surveys/new`
      );

      // Answer question and go to next page
      cy.get('fieldset').first().find('input').first().check({ force: true });
      cy.dataCy('e2e-next-page').click();

      // Confirm we are on demographic question page
      cy.get('form').contains(fieldName);

      // Fill in demographic question
      const answer = randomString(10);
      cy.get('form').find('input').first().type(answer);

      // Intercept submit request
      cy.intercept('POST', '/web_api/v1/ideas').as('submitSurvey');

      // Submit survey
      cy.dataCy('e2e-submit-form').click();

      // Make sure request body contains custom field value
      cy.wait('@submitSurvey').then((interception) => {
        const ideaPayload = interception.request.body.idea;
        expect(ideaPayload[`u_${customFieldKey}`]).to.eq(answer);
      });

      // Now we should be on last page
      cy.dataCy('e2e-after-submission').should('exist');
    };

    describe('Collect all data', () => {
      it('works', () => {
        fieldsInSurvey();
      });
    });

    describe('Collect demographics only', () => {
      before(() => {
        // Set up data collection for demographics only
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            phaseId,
            permitted_by: 'everyone',
            user_fields_in_form: true,
            user_data_collection: 'demographics_only',
          });
        });
      });

      it('works', () => {
        fieldsInSurvey();
      });
    });
  });

  describe('As a user with name and confirmed email', () => {
    const fieldsInForm = () => {
      cy.visit(`/projects/${projectSlug}`);

      // Click take survey button
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      // Confirm we're in the survey now
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/surveys/new`
      );

      // Answer question and go to next page
      cy.get('fieldset').first().find('input').first().check({ force: true });
      cy.dataCy('e2e-next-page').click();

      // Confirm we are on demographic question page
      cy.get('form').contains(fieldName);

      // Fill in demographic question
      answer = randomString(10);
      cy.get('form').find('input').first().type(answer);

      // Intercept submit request
      cy.intercept('PATCH', '/web_api/v1/ideas/**').as('submitSurvey');

      // Submit survey
      cy.dataCy('e2e-submit-form').click();

      // Make sure request body contains custom field value
      cy.wait('@submitSurvey').then((interception) => {
        const ideaPayload = interception.request.body.idea;
        expect(ideaPayload[`u_${customFieldKey}`]).to.eq(answer);
      });

      // Now we should be on last page
      cy.dataCy('e2e-after-submission').should('exist');
      confirmSavedToProfile();
    };

    const createUser = () => {
      if (userId) {
        cy.logout();
        cy.apiRemoveUser(userId);
      }

      const userFirstName = randomString(10);
      const userLastName = randomString(10);
      const userPassword = randomString(10);
      const userEmail = randomEmail();

      cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
        (response) => {
          cy.setLoginCookie(userEmail, userPassword);
          cy.setConsentCookie();
          userId = response.body.data.id;
        }
      );
    };

    beforeEach(() => {
      createUser();
    });

    describe('Collect all data', () => {
      before(() => {
        // Set up data collection for all data
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            phaseId,
            permitted_by: 'everyone',
            user_fields_in_form: true,
            user_data_collection: 'all_data',
          });
        });
      });

      it('works', () => {
        fieldsInForm();
        confirmSavedToProfile();
      });
    });

    describe('Collect demographics only', () => {
      before(() => {
        // Set up data collection for demographics only
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            phaseId,
            permitted_by: 'everyone',
            user_fields_in_form: true,
            user_data_collection: 'demographics_only',
          });
        });
      });

      it('works', () => {
        fieldsInForm();
        confirmSavedToProfile();
      });
    });
  });
});
