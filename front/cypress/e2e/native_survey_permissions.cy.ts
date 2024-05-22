import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

describe('Native survey permissions', () => {
  describe('Native survey for smart group (question defining smart group asked in flow)', () => {
    let customFieldId = '';
    let customFieldOptionId = '';
    let smartGroupId = '';
    let projectId = '';
    let projectSlug = '';
    let phaseId = '';

    const twoDaysAgo = moment().subtract(2, 'days').format('DD/MM/YYYY');
    const inTwoMonths = moment().add(2, 'month').format('DD/MM/YYYY');

    const fieldName = randomString(10);

    before(() => {
      // Create custom field
      cy.apiCreateCustomField(fieldName, true, false, 'select').then(
        (response) => {
          customFieldId = response.body.data.id;

          // Create custom field options
          cy.apiCreateCustomFieldOption('Option A', customFieldId).then(
            (response) => {
              customFieldOptionId = response.body.data.id;

              cy.apiCreateCustomFieldOption('Option B', customFieldId).then(
                () => {
                  // Create smart group based on custom field
                  cy.apiCreateSmartGroupCustomField(
                    'Option A people',
                    customFieldId,
                    customFieldOptionId
                  ).then((response) => {
                    smartGroupId = response.body.data.id;

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

                        // Set permission to smart group
                        cy.apiSetPhasePermission({
                          phaseId,
                          action: 'posting_idea',
                          permissionBody: {
                            permission: {
                              // Don't ask global custom fields
                              global_custom_fields: false,
                              permitted_by: 'groups',
                              group_ids: [smartGroupId],
                            },
                          },
                        }).then(() => {
                          // Only ask this custom field
                          cy.apiSetPermissionCustomField(
                            phaseId,
                            'posting_idea',
                            customFieldId
                          );
                        });
                      });
                    });
                  });
                }
              );
            }
          );
        }
      );
    });

    after(() => {
      cy.apiRemoveProject(projectId);
      cy.apiRemoveSmartGroup(smartGroupId);
      cy.apiRemoveCustomField(customFieldId);
    });

    it('lets you participate if you enter correct custom field value', () => {
      cy.visit(`/projects/${projectSlug}`);

      // Auth modal opens correctly
      cy.get('#e2e-cta-button').find('button').click({ force: true });
      cy.get('#e2e-authentication-modal').should('exist');

      // Complete email sign up
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();

      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('[data-testid="termsAndConditionsAccepted"] .e2e-checkbox')

        .click()
        .should('have.class', 'checked');
      cy.get('[data-testid="privacyPolicyAccepted"] .e2e-checkbox')
        .click()
        .should('have.class', 'checked');
      cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);

      // Enter email confirmation code
      cy.get('#code').should('exist');
      cy.get('#code').click().type('1234');
      cy.get('#e2e-verify-email-button').click();

      // Enter custom fields step
      // At this point there should be only one custom field shown
      cy.get('#e2e-signup-custom-fields-container')
        .get('label')
        .should('have.length', 1);

      // Select Option A
      cy.get('#e2e-signup-custom-fields-container').get('select').select(1);

      // Submit custom fields
      cy.get('#e2e-signup-custom-fields-submit-btn').click();

      // Continue in success modal
      cy.get('#e2e-sign-up-success-modal');
      cy.get('#e2e-success-continue-button > button').click({ force: true });

      // Expect to be redirected to survey
      cy.wait(5000);
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/ideas/new`
      );
    });

    it('does not let you participate if you enter incorrect custom field value', () => {
      cy.visit(`/projects/${projectSlug}`);

      // Auth modal opens correctly
      cy.get('#e2e-cta-button').find('button').click({ force: true });
      cy.get('#e2e-authentication-modal').should('exist');

      // Complete email sign up
      const firstName = randomString();
      const lastName = randomString();
      const email = randomEmail();
      const password = randomString();

      cy.get('#firstName').type(firstName);
      cy.get('#lastName').type(lastName);
      cy.get('#email').type(email);
      cy.get('#password').type(password);
      cy.get('[data-testid="termsAndConditionsAccepted"] .e2e-checkbox')
        .click()
        .should('have.class', 'checked');
      cy.get('[data-testid="privacyPolicyAccepted"] .e2e-checkbox')
        .click()
        .should('have.class', 'checked');
      cy.get('#e2e-signup-password-submit-button').wait(500).click().wait(500);

      // Enter email confirmation code
      cy.get('#code').should('exist');
      cy.get('#code').click().type('1234');
      cy.get('#e2e-verify-email-button').click();

      // Enter custom fields step
      // At this point there should be only one custom field shown
      cy.get('#e2e-signup-custom-fields-container')
        .get('label')
        .should('have.length', 1);

      // Select Option B
      cy.get('#e2e-signup-custom-fields-container').get('select').select(2);

      // Submit custom fields
      cy.get('#e2e-signup-custom-fields-submit-btn').click();

      // Expect to be kicked out of auth modal
      cy.get('#e2e-authentication-modal').should('not.exist');

      // Expect button to be disabled
      cy.wait(5000);
      cy.get('#e2e-cta-button').find('button').should('be.disabled');
    });

    // it('lets you participate if you exit flow after confirming email, but then return', () => {
    //   // TODO this is actually broken now. Implement and fix this test
    // })
  });
});
