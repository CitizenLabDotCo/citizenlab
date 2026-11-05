import { randomString } from '../../../support/commands';

describe('Admin: add projects to folder', () => {
  let projectId1: string;
  let projectId2: string;
  let folderId: string;
  let projectTitle1: string;
  let projectTitle2: string;
  let folderTitle: string;

  beforeEach(() => {
    projectTitle1 = randomString();
    projectTitle2 = randomString();
    folderTitle = randomString();
    const description = randomString();

    // Seed the two published projects and an (empty) published folder through
    // the API rather than the UI. The old test built the folder by hand — typing
    // the title into every locale switcher with fixed `cy.wait(2000)`s, then
    // writing the description through the Content Builder (Quill) — none of which
    // is what this test verifies. That UI-heavy, fixed-wait setup was the source
    // of the CI flakiness (nightly failures timed out on `#e2e-admin-folders-
    // projects-list` never rendering). Setting the state up via the API removes
    // all of it and leaves the test focused on adding projects to the folder.
    cy.apiCreateProject({
      title: projectTitle1,
      descriptionPreview: description,
      publicationStatus: 'published',
    }).then((project) => {
      projectId1 = project.body.data.id;
    });

    cy.apiCreateProject({
      title: projectTitle2,
      descriptionPreview: description,
      publicationStatus: 'published',
    }).then((project) => {
      projectId2 = project.body.data.id;
    });

    cy.apiCreateFolder({
      title: folderTitle,
      descriptionPreview: description,
      publicationStatus: 'published',
    }).then((folder) => {
      folderId = folder.body.data.id;
    });
  });

  afterEach(() => {
    // Remove the projects while they still exist, then the (now empty) folder,
    // so repeated runs / retries start from clean state.
    if (projectId1) cy.apiRemoveProject(projectId1);
    if (projectId2) cy.apiRemoveProject(projectId2);
    if (folderId) cy.apiRemoveFolder(folderId);
  });

  it('adds projects to a folder and shows them on the folder page', () => {
    cy.setAdminLoginCookie();

    // Adding a project to a folder issues a PATCH to that project. Waiting on the
    // request itself — instead of the old `cy.wait(3000)` — is what makes this
    // deterministic: we only assert the folder list once the membership change
    // has actually come back.
    cy.intercept('PATCH', '**/web_api/v1/projects/*').as('updateMembership');

    cy.visit(`/admin/projects/folders/${folderId}/projects`);

    // Both projects are offered in the "projects you can add" list.
    cy.get(`[data-cy="e2e-manage-button-${projectId1}"]`).should('exist');
    cy.get(`[data-cy="e2e-manage-button-${projectId2}"]`).should('exist');

    // Add the first project, then wait for its PATCH to resolve before the next.
    cy.get(`[data-cy="e2e-manage-button-${projectId1}"]`)
      .find('button')
      .scrollIntoView()
      .click();
    cy.wait('@updateMembership');

    // Add the second project and wait for its PATCH to resolve.
    cy.get(`[data-cy="e2e-manage-button-${projectId2}"]`)
      .find('button')
      .scrollIntoView()
      .click();
    cy.wait('@updateMembership');

    // Both projects now appear in the folder's "projects already added" list.
    cy.get('#e2e-admin-folders-projects-list')
      .contains(projectTitle1)
      .should('exist');
    cy.get('#e2e-admin-folders-projects-list')
      .contains(projectTitle2)
      .should('exist');

    // The public folder page shows the folder title and both projects.
    cy.get('#to-projectFolder').click();
    cy.get('#e2e-folder-page').contains(folderTitle).should('exist');
    cy.get('#e2e-folder-page').contains(projectTitle1).should('exist');
    cy.get('#e2e-folder-page').contains(projectTitle2).should('exist');

    // On a project that is in the folder, the folder-preview dropdown lists its
    // sibling project.
    cy.visit(`/admin/projects/${projectId1}`);
    cy.dataCy('e2e-folder-preview-open-projects-dropdown')
      .should('be.visible')
      .click();
    cy.contains(projectTitle2).should('exist');
  });
});
