import { randomString, randomEmail } from '../support/commands';

describe('Invitation authentication flow', () => {
  // let projectId = '';
  // const projectTitle = randomString();
  // const projectDescriptionPreview = randomString();
  // const projectDescription = randomString();
  // before(() => {
  //   cy.apiCreateProject({
  //     type: 'continuous',
  //     title: projectTitle,
  //     descriptionPreview: projectDescriptionPreview,
  //     description: projectDescription,
  //     publicationStatus: 'published',
  //     participationMethod: 'ideation',
  //   }).then((project) => {
  //     projectId = project.body.data.id;
  //     cy.intercept(`**/projects/${projectId}/permissions/posting_idea`).as(
  //       'setPermissionRequest'
  //     );
  //     cy.setAdminLoginCookie();
  //     cy.visit(`/admin/projects/${projectId}/permissions`);
  //     cy.get('#e2e-permission-email-confirmed-users').click();
  //     cy.wait('@setPermissionRequest').then(() => {
  //       cy.logout();
  //     });
  //   });
  // });
});
