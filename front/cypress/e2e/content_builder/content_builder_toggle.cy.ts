import { randomString } from '../../support/commands';

describe('Content builder toggle', () => {
  let projectId = '';
  let projectSlug = '';
  let userId = '';
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = 'Original project description.';

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser().then((user) => {
      userId = user.body.data.id;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
      assigneeId: userId,
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = projectTitle;
      cy.visit(`/projects/${projectSlug}`);
    });
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
  });

  it('shows original description by default along with any attachments if content builder is not used', () => {
    cy.intercept(`**/projects/${projectId}`).as('saveProject');
    cy.intercept(`**/projects/${projectId}/files`).as('saveProjectFiles');

    // Attach a project file
    cy.visit(`admin/projects/${projectId}`);
    cy.scrollTo('bottom');
    cy.acceptCookies();
    cy.get('#e2e-project-file-uploader').selectFile(
      'cypress/fixtures/example.pdf'
    );
    cy.wait(4000);
    // Submit project
    cy.get('.e2e-submit-wrapper-button').click();
    cy.wait('@saveProject');
    cy.wait('@saveProjectFiles');
    cy.contains('Your form has been saved!').should('be.visible');

    // Go to project page
    cy.visit(`/projects/${projectSlug}`);
    // Check that original project description is visible
    cy.contains('Original project description.').should('be.visible');
    // Check that attachment is present
    cy.contains('example.pdf').should('exist');
  });

  it('shows original description when content builder is enabled but there is no content yet', () => {
    cy.visit(`/admin/projects/${projectId}/description`);
    cy.get('#e2e-toggle-enable-content-builder')
      .find('input')
      .click({ force: true });
    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Original project description.').should('be.visible');
  });

  it('shows attachments added to the project after description added using content builder', () => {
    cy.intercept(`**/projects/${projectId}`).as('saveProject');
    cy.intercept(`**/projects/${projectId}/files`).as('saveProjectFiles');
    cy.intercept('**/content_builder_layouts/project_description/upsert').as(
      'saveContentBuilder'
    );

    // Attach a project file
    cy.visit(`admin/projects/${projectId}`);
    cy.scrollTo('bottom');
    cy.acceptCookies();
    cy.get('#e2e-project-file-uploader').selectFile(
      'cypress/fixtures/example.pdf'
    );

    // Save project after adding attachment
    cy.get('.e2e-submit-wrapper-button').click();
    cy.wait('@saveProject');
    cy.wait('@saveProjectFiles');
    cy.contains('Your form has been saved!').should('be.visible');

    cy.visit(`/admin/projects/${projectId}/description`);
    cy.get('#e2e-toggle-enable-content-builder')
      .find('input')
      .click({ force: true });

    cy.visit(`/admin/content-builder/projects/${projectId}/description`);

    // Add content using content builder
    cy.get('#e2e-draggable-text').dragAndDrop('#e2e-content-builder-frame', {
      position: 'inside',
    });

    cy.get('#e2e-text-box').click('center');
    cy.get('#quill-editor').click();
    cy.get('#quill-editor').type('Edited text.', { force: true });

    cy.get('#e2e-content-builder-topbar-save').click();
    cy.wait('@saveContentBuilder');

    cy.visit(`/projects/${projectSlug}`);
    cy.contains('Edited text.').should('be.visible');

    // Check that attachment is present
    cy.contains('example.pdf').should('exist');
  });
});
