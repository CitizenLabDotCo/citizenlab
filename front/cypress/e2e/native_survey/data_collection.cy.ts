import { updatePermission } from '../../support/permitted_by_utils';
import { setSurvey } from './utils';
import { randomString, randomEmail } from '../../support/commands';

describe('Native survey data collection', () => {
  describe('permitted_by = everyone', () => {
    let projectId = '';
    let phaseId = '';
    let projectSlug = '';
    let question1key = '';
    let question2key = '';
    let question3key = '';
    let question1Option1Key = '';
    let question2Option1Key = '';

    before(() => {
      cy.createProjectWithNativeSurveyPhase().then((result) => {
        projectId = result.projectId;
        phaseId = result.phaseId;
        projectSlug = result.projectSlug;

        return updatePermission({
          phaseId,
          permitted_by: 'everyone',
          user_fields_in_form: false,
        }).then(() => {
          return setSurvey(cy, phaseId).then((response) => {
            const data = response.body.data;
            const question1 = data[1];
            const question2 = data[3];
            const question3 = data[5];

            question1key = question1.attributes.key;
            question2key = question2.attributes.key;
            question3key = question3.attributes.key;

            const included = response.body.included;
            question1Option1Key = included[1].attributes.key;
            question2Option1Key = included[3].attributes.key;
          });
        });
      });
    });

    after(() => {
      cy.apiRemoveProject(projectId);
    });

    describe('as a visitor', () => {
      it('saves all survey data', () => {
        cy.visit(`/projects/${projectSlug}`);

        // Click take survey button
        cy.get('.e2e-idea-button')
          .first()
          .find('button')
          .click({ force: true });

        // Confirm we're in the survey now
        cy.location('pathname').should(
          'eq',
          `/en/projects/${projectSlug}/surveys/new`
        );

        // Answer first question and go to next page
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.dataCy('e2e-next-page').click();

        // Answer second question and go to next page
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.dataCy('e2e-next-page').click();

        // Answer third question
        cy.get(`input#${question3key}`).type('This is an open ended answer');

        // Submit survey
        cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitSurvey');
        cy.dataCy('e2e-submit-form').click();

        // Make sure request body contains custom field value
        cy.wait('@submitSurvey').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
          expect(ideaPayload[question2key]).to.eq(question2Option1Key);
          expect(ideaPayload[question3key]).to.eq(
            'This is an open ended answer'
          );
        });

        // Now we should be on last page
        cy.dataCy('e2e-after-submission').should('exist');
      });
    });

    describe('as a logged in user', () => {
      before(() => {
        const email = randomEmail();
        const password = randomString();

        cy.apiSignup(randomString(), randomString(), email, password).then(
          () => {
            cy.setLoginCookie(email, password);
          }
        );
      });

      it('saves all survey data', () => {
        cy.visit(`/projects/${projectSlug}`);

        // Click take survey button
        cy.get('.e2e-idea-button')
          .first()
          .find('button')
          .click({ force: true });

        // Confirm we're in the survey now
        cy.location('pathname').should(
          'eq',
          `/en/projects/${projectSlug}/surveys/new`
        );

        // Answer first question and go to next page
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.wait(1000);
        cy.intercept('POST', '/web_api/v1/phases/*/inputs').as('submitPage1');
        cy.dataCy('e2e-next-page').click();
        cy.wait('@submitPage1').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
        });

        // Answer second question and go to next page
        cy.wait(1000);
        cy.get('fieldset').first().find('input').first().check({ force: true });
        cy.wait(1000);
        cy.intercept('PATCH', '/web_api/v1/ideas/**').as('submitPage2');
        cy.dataCy('e2e-next-page').click();
        cy.wait('@submitPage2').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
          expect(ideaPayload[question2key]).to.eq(question2Option1Key);
        });

        // Answer third question
        cy.get(`input#${question3key}`).type('This is an open ended answer');

        // Submit survey
        cy.intercept('PATCH', '/web_api/v1/ideas/**').as('submitSurvey');
        cy.dataCy('e2e-submit-form').click();

        // Make sure request body contains custom field value
        cy.wait('@submitSurvey').then((interception) => {
          const ideaPayload = interception.request.body.idea;
          expect(ideaPayload[question1key]).to.eq(question1Option1Key);
          expect(ideaPayload[question2key]).to.eq(question2Option1Key);
          expect(ideaPayload[question3key]).to.eq(
            'This is an open ended answer'
          );
        });

        // Now we should be on last page
        cy.dataCy('e2e-after-submission').should('exist');
      });
    });
  });
});
