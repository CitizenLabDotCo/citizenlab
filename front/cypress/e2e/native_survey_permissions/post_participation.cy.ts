import { signUpEmailConformation, enterUserInfo } from '../../support/auth';
import { randomString } from '../../support/commands';
import {
  updatePermission,
  setupProject,
  addPermissionsCustomField,
  confirmUserCustomFieldHasValue,
} from '../../support/permitted_by_utils';

describe('Post Participation Signup: survey', () => {
  let customFieldId = '';
  let customFieldKey = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';
  let fieldName = '';
  let userId: string | undefined;

  before(() => {
    // Create custom field
    setupProject({ participationMethod: 'native_survey' }).then((data) => {
      customFieldId = data.customFieldId;
      customFieldKey = data.customFieldKey;
      projectId = data.projectId;
      projectSlug = data.projectSlug;
      phaseId = data.phaseId;
      fieldName = data.fieldName;

      return cy
        .apiLogin('admin@govocal.com', 'democracy2.0')
        .then((response) => {
          const adminJwt = response.body.jwt;

          return updatePermission({
            adminJwt,
            phaseId,
            permitted_by: 'everyone',
          }).then(() => {
            return addPermissionsCustomField({
              adminJwt,
              phaseId,
              customFieldId,
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

  it('Allows claiming participation by post-participation signup', () => {
    cy.visit(`/projects/${projectSlug}`);

    // Click take survey button
    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    // Confirm we're in the survey now
    cy.location('pathname').should(
      'eq',
      `/en/projects/${projectSlug}/surveys/new`
    );

    // Answer question
    cy.get('fieldset').first().find('input').first().check({ force: true });

    // Confirm we are on demographic question page
    cy.get('form').contains(fieldName);

    // Fill in demographic question
    const answer = randomString(10);
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

    // Click button to enter post-participation sign up flow
    cy.dataCy('post-participation-signup').click();

    // Sign up
    signUpEmailConformation(cy);
    const firstName = randomString(10);
    const lastName = randomString(10);
    enterUserInfo(cy, { firstName, lastName });
    cy.get('#e2e-success-continue-button').find('button').click();

    // Make sure we get redirected to project
    cy.location('pathname').should('eq', `/en/projects/${projectSlug}`);

    // Check and confirm that user has submission
    cy.visit(`/en/profile/${firstName}-${lastName}/surveys`);
    cy.get(`a[href="/en/projects/${projectSlug}"]`).should('exist');

    // Confirm user's profile has been updated with correct custom field values
    confirmUserCustomFieldHasValue({
      key: customFieldKey,
      value: answer,
    });
  });
});
