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

  describe('Project attachments', () => {
    it('File attachments can be added, reordered, and saved correctly', () => {
      cy.setConsentAndAdminLoginCookies();

      cy.intercept(`**/files`).as('saveProjectFiles');

      // Visit the project settings page
      cy.visit(`admin/projects/${projectId}/general`);

      // This 4s wait is necesssary. I tried waiting in a number of other ways,
      // but this was the only consistent solution.
      cy.wait(4000);
      cy.scrollTo('bottom');

      // Open the file upload modal
      cy.get('#e2e-open-file-upload-modal-button').click();
      cy.get('#e2e-file-upload-input').should('exist');
      // Attach a project file
      cy.get('#e2e-file-upload-input').selectFile(
        'cypress/fixtures/example.pdf'
      );
      // Wait for the file to be visible
      cy.contains('example.pdf').should('be.visible');

      // Attach another project file
      cy.get('#e2e-open-file-upload-modal-button').click();
      cy.get('#e2e-file-upload-input').should('exist');
      cy.get('#e2e-file-upload-input').selectFile(
        'cypress/fixtures/example.txt'
      );
      // Wait for the file to be visible
      cy.contains('example.txt').should('be.visible');

      // Save the project
      cy.get('.e2e-submit-wrapper-button button').click();
      cy.wait('@saveProjectFiles');
      cy.contains('Your form has been saved!').should('be.visible');

      // Reload page to ensure files are persisted
      cy.reload();
      cy.wait(4000);
      cy.scrollTo('bottom');

      // Verify both files still exist after reload
      cy.dataCy('e2e-file-uploader-container')
        .find('.files-list')
        .children()
        .children()
        .then((files) => {
          expect(files).to.have.length(2);
          expect(files[0].innerText).to.contain('example.pdf');
          expect(files[1].innerText).to.contain('example.txt');
        });

      // Swap the order of the files
      // Drag "example.txt" (index 1) above "example.pdf" (index 0)
      const dataTransfer = new DataTransfer();

      // Get the file elements by their position in the list
      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(1) // example.txt is at index 1
        .trigger('dragstart', { dataTransfer });

      cy.wait(1000);

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(0) // example.pdf is at index 0
        .trigger('dragenter', { dataTransfer })
        .trigger('dragover', { dataTransfer })
        .trigger('drop', { dataTransfer });

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(1)
        .trigger('dragend', { dataTransfer });

      // Save project
      cy.get('.e2e-submit-wrapper-button button').click();
      cy.wait('@saveProjectFiles');
      cy.contains('Your form has been saved!').should('be.visible');

      cy.reload();
      cy.wait(4000);
      cy.scrollTo('bottom');

      cy.dataCy('e2e-file-uploader-container')
        .find('.files-list')
        .children()
        .children()
        .then((files) => {
          expect(files[0].innerText).to.contain('example.txt');
          expect(files[1].innerText).to.contain('example.pdf');
        });

      // Attach another new file, reorder to top of list and save
      cy.get('#e2e-open-file-upload-modal-button').click();
      cy.get('#e2e-file-upload-input').selectFile('cypress/fixtures/icon.png');
      // Wait for the file to be visible
      cy.contains('icon.png').should('be.visible');

      // Reorder the files, so icon.png is first
      const dataTransfer2 = new DataTransfer();

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(2) // icon.png is at index 2
        .trigger('dragstart', { dataTransfer2 });

      cy.wait(1000);

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(0) // example.txt is at index 0
        .trigger('dragenter', { dataTransfer2 })
        .trigger('dragover', { dataTransfer2 })
        .trigger('drop', { dataTransfer2 });

      cy.get('[data-cy="e2e-file-uploader-container"] .files-list')
        .children()
        .children()
        .eq(2)
        .trigger('dragend', { dataTransfer2 });

      // Save, reload, and confirm the order is correct
      cy.get('.e2e-submit-wrapper-button button').click();
      cy.wait('@saveProjectFiles');
      cy.contains('Your form has been saved!').should('be.visible');

      cy.reload();
      cy.wait(2000);

      cy.dataCy('e2e-file-uploader-container')
        .find('.files-list')
        .children()
        .children()
        .then((files) => {
          expect(files[0].innerText).to.contain('icon.png');
          expect(files[1].innerText).to.contain('example.txt');
          expect(files[2].innerText).to.contain('example.pdf');
        });
    });
  });
});
