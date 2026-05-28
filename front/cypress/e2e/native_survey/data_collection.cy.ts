import {
  updatePermission
} from '../../support/permitted_by_utils';
import { setSurvey } from './utils';

describe('Native survey data collection', () => {
  describe('permitted_by = everyone', () => {
    let projectId = '';
    let phaseId = '';
    let projectSlug = '';

    before(() => {
      cy.createProjectWithNativeSurveyPhase().then((result) => {
        projectId = result.projectId;
        phaseId = result.phaseId;
        projectSlug = result.projectSlug;

        return updatePermission({
          phaseId,
          permitted_by: 'everyone'
        }).then(() => {
          setSurvey(cy, phaseId);
        })
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    describe('as a visitor', () => {
      it('saves all survey data', () => {
        cy.visit(`/projects/${projectSlug}`);

        // Click take survey button
        cy.get('.e2e-idea-button').first().find('button').click({ force: true });

        // Confirm we're in the survey now
        cy.location('pathname').should(
          'eq',
          `/en/projects/${projectSlug}/surveys/new`
        );

        cy.wait(10000);

        // Answer question and go to next page
        // TODO answer a bunch of questions

        // Intercept submit request
        cy.intercept('POST', '/web_api/v1/ideas').as('submitSurvey');

        // Submit survey
        cy.dataCy('e2e-submit-form').click();

        // Make sure request body contains custom field value
        cy.wait('@submitSurvey').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          throw new Error(JSON.stringify(ideaPayload));
          // expect(ideaPayload[`u_${customFieldKey}`]).to.eq(answer);
        });

        // Now we should be on last page
        cy.dataCy('e2e-after-submission').should('exist');
      });
    });
  });
});
