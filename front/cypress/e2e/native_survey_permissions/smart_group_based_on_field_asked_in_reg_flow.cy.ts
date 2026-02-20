import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';
import { signUpEmailConformation, enterUserInfo } from '../../support/auth';

describe('Native survey permissions', () => {
  describe('Native survey for smart group (question defining smart group asked in registration flow)', () => {
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
      cy.apiCreateCustomField(fieldName, false, 'select').then((response) => {
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
                            permitted_by: 'users',
                            group_ids: [smartGroupId],
                          },
                        },
                      });
                    });
                  });
                });
              }
            );
          }
        );
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
      cy.apiRemoveSmartGroup(smartGroupId);
      cy.apiRemoveCustomField(customFieldId);
    });

    it('lets you participate if you enter correct custom field value', () => {
      cy.visit(`/projects/${projectSlug}`);

      // Auth modal opens correctly
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });
      cy.get('#e2e-authentication-modal').should('exist');

      // Complete email sign up
      signUpEmailConformation(cy);
      enterUserInfo(cy);

      // Enter custom fields step
      cy.get('#e2e-signup-custom-fields-container');

      // Select Option A
      cy.get('#e2e-signup-custom-fields-container')
        .get('select')
        .first()
        .select(1);

      // Submit custom fields
      cy.get('#e2e-signup-custom-fields-submit-btn').click();

      // Continue in success modal
      cy.get('#e2e-sign-up-success-modal');
      cy.get('#e2e-success-continue-button > button').click({ force: true });

      // Expect to be redirected to survey
      cy.wait(5000);
      cy.location('pathname').should(
        'eq',
        `/en/projects/${projectSlug}/surveys/new`
      );
    });

    it('does not let you participate if you enter incorrect custom field value', () => {
      cy.visit(`/projects/${projectSlug}`);

      // Auth modal opens correctly
      cy.get('.e2e-idea-button').first().find('button').click({ force: true });
      cy.get('#e2e-authentication-modal').should('exist');

      // Complete email sign up
      signUpEmailConformation(cy);
      enterUserInfo(cy);

      // Enter custom fields step
      cy.get('#e2e-signup-custom-fields-container');

      // Select Option B
      cy.get('#e2e-signup-custom-fields-container')
        .get('select')
        .first()
        .select(2);

      // Submit custom fields
      cy.get('#e2e-signup-custom-fields-submit-btn').click();

      // Expect to see access denied step
      cy.get('#e2e-access-denied-step').should('exist');

      // Close modal
      cy.get('.e2e-modal-close-button').click();

      // Expect button to be disabled
      cy.wait(5000);
      cy.get('.e2e-idea-button')
        .first()
        .find('button')
        .should('have.attr', 'aria-disabled', 'true');
    });

    // it('lets you participate if you exit flow after confirming email, but then return', () => {
    //   // TODO this is actually broken now. Implement and fix this test
    // })
  });
});
