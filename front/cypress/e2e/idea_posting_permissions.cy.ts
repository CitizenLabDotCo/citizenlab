import moment = require('moment');
import { randomString, randomEmail } from '../support/commands';

// describe('Idea posting permissions', () => {
//   const unverifiedFirstName = randomString();
//   const unverifiedLastName = randomString();
//   const unverifiedEmail = randomEmail();
//   const unverifiedPassword = randomString();
//   let unverifiedId: string;

//   const verifiedFirstName = randomString();
//   const verifiedLastName = randomString();
//   const verifiedEmail = randomEmail();
//   const verifiedPassword = randomString();
//   let verifiedId: string;

//   before(() => {
//     // create verified user
//     cy.apiSignup(
//       verifiedFirstName,
//       verifiedLastName,
//       verifiedEmail,
//       verifiedPassword
//     )
//       .then((response) => {
//         verifiedId = response.body.data.id;
//         // create unverified user
//         return cy.apiSignup(
//           unverifiedFirstName,
//           unverifiedLastName,
//           unverifiedEmail,
//           unverifiedPassword
//         );
//       })
//       .then((response) => {
//         unverifiedId = response.body.data.id;
//         return cy.apiLogin(verifiedEmail, verifiedPassword);
//       })
//       .then((response) => {
//         cy.apiVerifyBogus(response.body.jwt);
//       });
//   });

//   describe('a project that requires verification', () => {
//     it('sends unverified users to the signup flow', () => {
//       cy.setLoginCookie(unverifiedEmail, unverifiedPassword);
//       cy.visit('projects/verified-ideation');
//       cy.acceptCookies();
//       cy.get('#e2e-idea-button').should('exist');
//       cy.get('#e2e-idea-button').first().click();
//       cy.get('#e2e-verification-wizard-root').should('exist');
//     });

//     it('lets verified users post', () => {
//       cy.setLoginCookie(verifiedEmail, verifiedPassword);
//       cy.visit('projects/verified-ideation');
//       cy.acceptCookies();
//       cy.get('#e2e-idea-button').should('exist');
//       cy.get('#e2e-idea-button').first().click();
//       cy.get('#e2e-idea-new-page').should('exist');
//     });
//   });

//   after(() => {
//     cy.apiRemoveUser(verifiedId);
//     cy.apiRemoveUser(unverifiedId);
//   });
// });

describe('idoes not redirect user to idea form upon authentication if they are not permitted to post', () => {
  const projectTitle = randomString(15);
  let projectId = '';
  let projectSlug = '';

  // Create project with smart group access posting rights
  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then((user) => {
        return cy.apiCreateProject({
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: '',
          description: randomString(),
          publicationStatus: 'published',
          assigneeId: user.body.data.id,
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'Ideation phase',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
        });
      })
      .then((phase) => {
        cy.apiGetProjectPermission({
          projectId,
          phaseId: phase?.body.data.id,
          action: 'posting_idea',
        }).then((response) => {
          console.log({ response });
          cy.apiSetProjectPermission({
            projectId,
            phaseId: phase?.body.data.id,
            action: 'posting_idea',
            permissionBody: {
              // Group for the Citizenlab Heroes smart group in the test environment
              permissionId: response?.body.data.id,
              permission: {
                permitted_by: 'groups',
                group_ids: ['472b0bfc-444a-4ad4-b7e8-342b37eb78a2'],
                global_custom_fields: true,
              },
            },
          });
        });
      });
  });

  it('tests', () => {
    console.log('test');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  // Click "new idea" button and sign up with user who is not part of the smart group
  // Confirm that the user was not redirect to the form and the button has a tooltip
});

// describe('idea posting permissions for non-active users', () => {
//   const firstName = randomString();
//   const lastName = randomString();
//   const email = randomEmail();
//   const password = randomString();
//   const randomFieldName = randomString();
//   let userId: string;
//   let customFieldId: string;

//   before(() => {
//     // create user
//     cy.apiCreateCustomField(randomFieldName, true, false).then((response) => {
//       customFieldId = response.body.data.id;
//       cy.apiSignup(firstName, lastName, email, password).then((response) => {
//         userId = response.body.data.id;
//       });
//       cy.setLoginCookie(email, password);
//     });
//   });

//   it("doesn't let non-active users comment", () => {
//     cy.setLoginCookie(email, password);
//     cy.visit('projects/verified-ideation');
//     cy.acceptCookies();
//     cy.get('#e2e-ideas-list').find('.e2e-idea-card').should('exist');
//     cy.get('#e2e-ideas-list').find('.e2e-idea-card').first().click();
//     cy.get('#e2e-verify-identity-to-comment').should('exist');
//     cy.get('#e2e-verify-identity-to-comment').click();
//     cy.get('#e2e-authentication-modal').should('exist');
//   });

//   after(() => {
//     cy.apiRemoveUser(userId);
//     cy.apiRemoveCustomField(customFieldId);
//   });
// });
