import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';

describe('Native survey permitted by: users', () => {
  let customFieldId = '';
  let customFieldKey = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';
  let userId: string | undefined;
  let ideaId: string | undefined;
  let answer: string | undefined;

  const fieldName = randomString(10);

  const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  const updatePermission = ({
    adminJwt,
    permitted_by,
    user_fields_in_form,
    user_data_collection,
  }: {
    adminJwt: string;
    permitted_by?: string;
    user_fields_in_form?: boolean;
    user_data_collection?: string;
  }) => {
    return cy.request({
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminJwt}`,
      },
      method: 'PATCH',
      url: `web_api/v1/phases/${phaseId}/permissions/posting_idea`,
      body: {
        permitted_by,
        user_fields_in_form,
        user_data_collection,
      },
    });
  };

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

          // Temporarily set permission to everyone_confirmed_email
          // to make sure we clear out the global settings
          return cy
            .apiLogin('admin@govocal.com', 'democracy2.0')
            .then((response) => {
              const adminJwt = response.body.jwt;

              return updatePermission({
                adminJwt,
                permitted_by: 'everyone_confirmed_email',
              }).then(() => {
                // Add one permissions custom field
                return cy
                  .request({
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${adminJwt}`,
                    },
                    method: 'POST',
                    url: `web_api/v1/phases/${phaseId}/permissions/posting_idea/permissions_custom_fields`,
                    body: {
                      custom_field_id: customFieldId,
                      required: true,
                    },
                  })
                  .then(() => {
                    // Set permission back to users
                    return updatePermission({
                      adminJwt,
                      permitted_by: 'users',
                    }).then(() => {
                      // Finally: go into the survey and save it
                      cy.setAdminLoginCookie();
                      cy.visit(
                        `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`
                      );
                      cy.get('form').submit();
                      cy.get('[data-testid="feedbackSuccessMessage"]');
                    });
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

  const fieldsInRegFlow = () => {
    cy.visit(`/projects/${projectSlug}`);

    // Click take survey button
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    // Modal should show demographic question
    cy.get('#e2e-authentication-modal').contains(fieldName);

    // Fill in demographic question
    answer = randomString(10);
    cy.get('#e2e-authentication-modal').find('input').first().type(answer);

    // Click submit and 'continue'
    cy.get('#e2e-signup-custom-fields-submit-btn').click();
    cy.get('#e2e-success-continue-button').click();

    // Confirm we're in the survey now
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    // Answer question
    cy.get('fieldset').first().find('input').first().check({ force: true });

    // Intercept submit request
    cy.intercept('POST', '/web_api/v1/ideas').as('submitSurvey');

    // Submit survey
    cy.dataCy('e2e-submit-form').click();
    cy.wait('@submitSurvey').then((interception) => {
      ideaId = interception.response?.body.data.id;
    });

    // Now we should be on last page
    cy.dataCy('e2e-after-submission').should('exist');
  };

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
    cy.intercept('GET', '/web_api/v1/ideas/draft/**').as('getDraftIdea');
    cy.dataCy('e2e-next-page').click();

    // Wait for draft idea request to complete
    cy.wait('@getDraftIdea');
    cy.wait(2000);

    // Confirm we are on demographic question page
    cy.get('form').contains(fieldName);

    // Fill in demographic question
    answer = randomString(10);
    cy.get('form').find('input').first().type(answer);

    // Intercept submit request
    cy.intercept('PATCH', '/web_api/v1/ideas/**').as('submitSurvey');

    // Submit survey
    cy.dataCy('e2e-submit-form').click();
    cy.wait('@submitSurvey').then((interception) => {
      ideaId = interception.response?.body.data.id;
    });

    // Now we should be on last page
    cy.dataCy('e2e-after-submission').should('exist');
  };

  const confirmSavedToProfile = () => {
    cy.intercept('GET', `/web_api/v1/users/me`).as('getMe');
    cy.visit('/');
    cy.wait('@getMe').then((interception) => {
      expect(interception.response?.statusCode).to.equal(200);
      expect(
        interception.response?.body.data.attributes.custom_field_values[
          customFieldKey
        ]
      ).to.eq(answer);
    });
  };

  const confirmSavedToIdea = () => {
    cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
      const adminJwt = response.body.jwt;

      return cy
        .request({
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminJwt}`,
          },
          method: 'GET',
          url: `web_api/v1/ideas/${ideaId}`,
        })
        .then((response) => {
          const attributes = response.body.data.attributes;
          expect(attributes[`u_${customFieldKey}`]).to.eq(answer);
        });
    });
  };

  describe('Collect all data', () => {
    describe('Ask demographic questions in registration flow', () => {
      it('works', () => {
        fieldsInRegFlow();
        confirmSavedToProfile();
        confirmSavedToIdea();
      });
    });

    describe('Ask demographic questions in survey', async () => {
      before(() => {
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            user_fields_in_form: true,
          });
        });
      });

      it('works', () => {
        fieldsInSurvey();
        confirmSavedToProfile();
        confirmSavedToIdea();
      });
    });
  });

  describe('Collect demographics only', () => {
    describe('Ask demographic questions in registration flow', () => {
      before(() => {
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            user_fields_in_form: false,
            user_data_collection: 'demographics_only',
          });
        });
      });

      it('works', () => {
        fieldsInRegFlow();
        confirmSavedToProfile();
        confirmSavedToIdea();
      });
    });

    describe('Ask demographic questions in survey', () => {
      before(() => {
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            user_fields_in_form: true,
          });
        });
      });

      it('works', () => {
        fieldsInSurvey();
        confirmSavedToProfile();
        confirmSavedToIdea();
      });
    });
  });

  describe('Full anonymity', () => {
    describe('Ask demographic questions in registration flow', () => {
      before(() => {
        cy.apiLogin('admin@govocal.com', 'democracy2.0').then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            user_fields_in_form: false,
            user_data_collection: 'anonymous',
          });
        });
      });

      it('works', () => {
        fieldsInRegFlow();
        confirmSavedToProfile();
      });
    });
  });
});
