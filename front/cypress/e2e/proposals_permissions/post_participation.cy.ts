import { randomString } from '../../support/commands';
import { signUpEmailConformation, enterUserInfo } from '../../support/auth';
import {
  updatePermission,
  setupProject,
  addPermissionsCustomField,
  confirmUserCustomFieldHasValue,
} from '../../support/permitted_by_utils';
import { fillOutTitleAndBody } from '../ideation_permissions/_utils';

describe('Post Participation Signup: ideation', () => {
  let customFieldId = '';
  let customFieldKey = '';
  let projectId = '';
  let projectSlug = '';
  let phaseId = '';
  let fieldName = '';
  let userId: string | undefined;

  before(() => {
    // Create custom field
    setupProject({ participationMethod: 'proposals' }).then((data) => {
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
    cy.visit(`projects/${projectSlug}/ideas/new`);

    // add a title and description
    const title = randomString(11);
    const body = randomString(40);
    fillOutTitleAndBody(cy, { title, body });

    // Skip page with files
    cy.dataCy('e2e-next-page').should('be.visible').click();

    // Skip to demographic question page
    cy.wait(1000);
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();

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

    // Click button to enter post-participation sign up flow
    cy.dataCy('post-participation-signup').click();

    // Sign up
    signUpEmailConformation(cy);
    const firstName = randomString(10);
    const lastName = randomString(10);
    enterUserInfo(cy, { firstName, lastName });
    cy.get('#e2e-success-continue-button').find('button').click();

    // Make sure we get redirected to idea
    cy.location('pathname').should('eq', `/en/ideas/${title}`);

    // Make sure that idea belongs to user
    cy.get('.e2e-author-link').should(
      'have.attr',
      'href',
      `/en/profile/${firstName}-${lastName}`
    );

    // Confirm user's profile has been updated with correct custom field values
    confirmUserCustomFieldHasValue({
      key: customFieldKey,
      value: answer,
    });
  });
});
