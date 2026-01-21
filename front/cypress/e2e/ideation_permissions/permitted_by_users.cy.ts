import moment = require('moment');
import { randomString, randomEmail } from '../../support/commands';
import { updatePermission } from '../../support/permissions';

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

  describe('In reg flow', () => {
    describe('Non-anonymous user', () => {
      it('stores user custom fields in idea', () => {
        cy.visit(`/projects/${projectSlug}`);
        cy.get('.e2e-idea-button')
          .first()
          .find('button')
          .click({ force: true });
      });
    });

    describe.skip('Anonymous user', () => {
      it('does not store user custom fields in idea', () => {
        // TODO
      });
    });
  });
});
