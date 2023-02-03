import { randomString } from '../../../support/commands';

describe('Form builder multiple choice choose multiple component', () => {
  const projectTitle = randomString();
  const projectDescription = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;

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
      projectSlug = project.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.wait(1000);
  });

  it('adds multiselect multiple choice field and is displayed when filling survey', () => {
    cy.get('[data-cy="e2e-multiple-choice"]').click();
    cy.get('#e2e-title-multiloc').type('Question title 2', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1 question 2', { force: true });
    cy.get('form').submit();
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains('Question title 2').should('exist');
    cy.contains('Option 1 question 2').should('exist');
    cy.get('#e2e-multiselect-control').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
