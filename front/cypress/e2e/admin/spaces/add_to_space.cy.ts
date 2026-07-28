import { randomString } from '../../../support/commands';
import { createSpace, removeSpace } from '../../../support/spaces';

describe('Add a project or folder to a space', () => {
  const spaceName = randomString(10);
  let spaceId: string;

  // Track resources created inside the tests so we can clean them up, and so
  // that a Cypress retry (which re-runs the whole `it`) creates a fresh
  // candidate rather than trying to re-add one that is already in the space.
  const createdProjectIds: string[] = [];
  const createdFolderIds: string[] = [];

  before(() => {
    createSpace({ title: spaceName }).then((response) => {
      spaceId = response.body.data.id;
    });
  });

  after(() => {
    createdProjectIds.forEach((id) => cy.apiRemoveProject(id));
    createdFolderIds.forEach((id) => cy.apiRemoveFolder(id));
    removeSpace(spaceId);
  });

  it('adds a project to the space', () => {
    const projectName = randomString(10);
    cy.apiCreateProject({
      title: projectName,
      description: randomString(),
    }).then((response) => {
      createdProjectIds.push(response.body.data.id);
    });

    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/spaces/${spaceId}`);

    cy.dataCy('e2e-add-to-space-button').click();
    // The type select defaults to "Project", so we only pick the project.
    cy.dataCy('e2e-add-to-space-item-select').select(projectName);
    cy.dataCy('e2e-add-to-space-submit').click();

    // The project now shows up in the list of projects and folders in the space.
    cy.contains(projectName).should('be.visible');
  });

  it('adds a folder to the space', () => {
    const folderName = randomString(10);
    cy.apiCreateFolder({
      title: folderName,
      description: randomString(),
    }).then((response) => {
      createdFolderIds.push(response.body.data.id);
    });

    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/spaces/${spaceId}`);

    cy.dataCy('e2e-add-to-space-button').click();
    cy.dataCy('e2e-add-to-space-type-select').select('folder');
    cy.dataCy('e2e-add-to-space-item-select').select(folderName);
    cy.dataCy('e2e-add-to-space-submit').click();

    // The folder now shows up in the list of projects and folders in the space.
    cy.contains(folderName).should('be.visible');
  });
});
