import { randomString } from '../../../support/commands';

describe('Form builder page element', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'native_survey',
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('adds page element and tests settings', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.get('[data-cy="e2e-page"]').click();
    cy.get('#e2e-title-multiloc').get('input').type('Page title');
    cy.get('#quill-multiloc-editor-en').click().type('Page description');
    cy.get('#e2e-settings-done-button').click();

    // Should show success message on saving
    cy.get('form').submit();
    cy.get('[data-testid="feedbackSuccessMessage"]').should('exist');

    // Reload page
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.contains('Page title').click();

    // Confirm the settings are loaded correctly
    cy.contains('Page title').should('exist');
    cy.contains('Page description').should('exist');

    // TODO: Update after front office is implemented. Should check that renderer displays data correctly.
  });
});
