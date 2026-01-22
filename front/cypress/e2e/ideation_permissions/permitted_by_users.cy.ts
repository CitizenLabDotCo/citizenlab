import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';
import { updatePermission } from '../../support/permitted_by_utils';
import { fillOutTitleAndBody } from './_utils';

describe('Ideation permitted by: users', () => {
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
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
          description: 'Some description',
          allow_anonymous_participation: true,
        }).then((phase) => {
          phaseId = phase.body.data.id;

          // Temporarily set permission to everyone_confirmed_email
          // to make sure we clear out the global settings
          return cy
            .apiLogin('admin@govocal.com', 'democracy2.0')
            .then((response) => {
              const adminJwt = response.body.jwt;

              return updatePermission(cy, {
                adminJwt,
                phaseId,
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
                    return updatePermission(cy, {
                      adminJwt,
                      phaseId,
                      permitted_by: 'users',
                    });
                  });
              });
            });
        });
      });
    });

    // Create user
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
  });

  after(() => {
    cy.apiRemoveProject(projectId);
    cy.apiRemoveCustomField(customFieldId);

    if (userId) {
      cy.apiRemoveUser(userId);
    }
  });

  const inRegFlow = () => {
    cy.visit(`/projects/${projectSlug}`);

    cy.get('.e2e-idea-button').first().find('button').click({ force: true });

    // Modal should show demographic question
    cy.get('#e2e-authentication-modal').contains(fieldName);

    // Fill in demographic question
    answer = randomString(10);
    cy.get('#e2e-authentication-modal').find('input').first().type(answer);

    // Click submit and 'continue'
    cy.get('#e2e-signup-custom-fields-submit-btn').click();
    cy.get('#e2e-success-continue-button').click();

    const title = randomString(11);
    const body = randomString(40);

    fillOutTitleAndBody(cy, { title, body });

    // Go to the next page of the idea form
    cy.get('[data-cy="e2e-next-page"]').should('be.visible').click();
  };

  describe('In reg flow', () => {
    describe('Non-anonymous user', () => {
      it('stores user custom fields in idea', () => {
        inRegFlow();

        // submit
        // TODO

        // check if custom field value is stored in idea
        // TODO
      });
    });

    describe.skip('Anonymous user', () => {
      it('does not store user custom fields in idea', () => {
        inRegFlow();

        // set to anonymous
        cy.get('[data-testid="e2e-post-idea-anonymously-checkbox"]').click();
        cy.get('#e2e-continue-anonymous-participation-btn').click();

        // submit
        // TODO

        // make sure custom field value is not stored in idea
        // TODO
      });
    });
  });
});
