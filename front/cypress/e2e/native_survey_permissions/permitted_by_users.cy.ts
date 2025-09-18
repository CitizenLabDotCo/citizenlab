import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';

describe('Native survey permitted by: users', () => {
  let customFieldId = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';
  let userId: string | undefined;

  const fieldName = randomString(10);

  const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
  const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

  const updatePermission = ({
    adminJwt,
    permitted_by,
  }: {
    adminJwt: string;
    permitted_by?: string;
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
      },
    });
  };

  before(() => {
    // Create custom field
    cy.apiCreateCustomField(fieldName, true, false).then((response) => {
      customFieldId = response.body.data.id;

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
      cy.apiRemoveUser(userId);
    }

    const userFirstName = randomString(10);
    const userLastName = randomString(10);
    const userPassword = randomString(10);
    const userEmail = randomEmail();

    cy.apiSignup(userFirstName, userLastName, userEmail, userPassword).then(
      (response) => {
        cy.setLoginCookie(userEmail, userPassword);
        userId = response.body.data.id;
      }
    );
  };

  describe('Collect all data', () => {
    beforeEach(() => {
      createUser();
    });

    it.only('Ask demographic questions in registration flow', () => {
      cy.visit(`/projects/${projectSlug}`);

      // Click take survey button
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });

      // Modal should show demographic question
      cy.get('#e2e-authentication-modal').contains(fieldName);

      // Fill in demographic question
      const answer = randomString(10);
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

      // Intercept response
      cy.intercept('POST', '/web_api/v1/ideas').as('submitSurvey');
      cy.dataCy('e2e-submit-form').click();

      cy.wait('@submitSurvey').then((interception) => {
        expect(interception.response?.statusCode).to.eq(201);
        const attributes = interception.response?.body.data.attributes;
        expect(attributes.custom_field_values[`u_${fieldName}`]).to.eq(answer);
      });
    });

    it('Ask demographic questions in survey', () => {
      // TODO
    });
  });

  describe('Collect demographics only', () => {
    it('Ask demographic questions in registration flow', () => {
      // TODO
    });

    it('Ask demographic questions in survey', () => {
      // TODO
    });
  });

  describe('Full anonymity', () => {
    it('Ask demographic questions in registration flow', () => {
      // TODO
    });
  });
});
