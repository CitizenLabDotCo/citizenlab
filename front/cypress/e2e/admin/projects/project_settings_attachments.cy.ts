import { randomString } from '../../../support/commands';

describe('Project attachments settings', () => {
  let projectId: string | null = null;

  beforeEach(() => {
    cy.setConsentAndAdminLoginCookies();

    cy.apiCreateProject({
      title: randomString(),
      description: randomString(),
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  after(() => {
    if (projectId) {
      cy.apiRemoveProject(projectId);
    }
  });

  // File attachments can be added, reordered and saved in a single go.

  // After saving, another file can be added, reordered and saved. Final order should be correct.

  describe('Project attachments', () => {
    it('File attachments can be added, reordered, and saved in a single go', () => {
      cy.intercept(`**/projects/${projectId}/files`).as('saveProjectFiles');

      // Visit the project settings page
      cy.visit(`admin/projects/${projectId}/settings`);

      // This 4s wait is necesssary. I tried waiting in a number of other ways,
      // but this was the only consistent solution.
      cy.wait(4000);
      cy.scrollTo('bottom');

      // Attach a project file
      cy.get('#e2e-project-file-uploader').selectFile(
        'cypress/fixtures/example.pdf'
      );
      // Wait for the file to be visible
      cy.contains('example.pdf').should('be.visible');

      // Attach another project file
      cy.get('#e2e-project-file-uploader').selectFile(
        'cypress/fixtures/example.txt'
      );
      // Wait for the file to be visible
      cy.contains('example.txt').should('be.visible');

      // Save the project
      cy.get('.e2e-submit-wrapper-button button').click();
      cy.wait('@saveProjectFiles');
      cy.contains('Your form has been saved!').should('be.visible');

      // Check that the files are in the correct order
      cy.get('[data-cy="e2e-file-uploader-container"]')
        .find('.files-list')
        .children()
        .children()
        .then((files) => {
          expect(files[0].innerText).to.contain('example.pdf');
          expect(files[1].innerText).to.contain('example.txt');
        });

      // Swap the order of the files
      // Drag "example.txt" (index 1) above "example.pdf" (index 0)
      // Create a real DataTransfer object
      const dataTransfer = new DataTransfer();

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(0)
        .trigger('dragstart', { dataTransfer });

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(1)
        .trigger('dragenter', { dataTransfer })
        .trigger('dragover', { dataTransfer })
        .trigger('drop', { dataTransfer });

      // Save project
      cy.get('.e2e-submit-wrapper-button button').click();
      cy.wait('@saveProjectFiles');
      cy.contains('Your form has been saved!').should('be.visible');

      cy.reload();

      cy.get('[data-cy="e2e-file-uploader-container"]')
        .find('.files-list')
        .children()
        .children()
        .then((files) => {
          console.log({ files });
          expect(files[0].innerText).to.contain('example.txt');
          expect(files[1].innerText).to.contain('example.pdf');
        });

      // Attach another new file, reorder to top of list and save
      cy.get('#e2e-project-file-uploader').selectFile(
        'cypress/fixtures/icon.png'
      );
      // Wait for the file to be visible
      cy.contains('icon.png').should('be.visible');

      // Reorder the fiels, so icon.png is first
      const dataTransfer2 = new DataTransfer();

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(2)
        .trigger('dragstart', { dataTransfer2 });

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(0)
        .trigger('dragenter', { dataTransfer2 })
        .trigger('dragover', { dataTransfer2 })
        .trigger('drop', { dataTransfer2 });

      // Save, reload, and confirm the order is correct
      cy.get('.e2e-submit-wrapper-button button').click();
      cy.wait('@saveProjectFiles');
      cy.contains('Your form has been saved!').should('be.visible');

      cy.reload();

      cy.get('[data-cy="e2e-file-uploader-container"]')
        .find('.files-list')
        .children()
        .children()
        .then((files) => {
          console.log({ files });
          expect(files[0].innerText).to.contain('icon.png');
          expect(files[1].innerText).to.contain('example.txt');
          expect(files[2].innerText).to.contain('example.pdf');
        });
    });

    it('A new attachment can be added to an existing list, reordered, and saved. Order after saving is correct.', () => {
      cy.visit(`admin/projects/${projectId}`);
    });
  });
});
