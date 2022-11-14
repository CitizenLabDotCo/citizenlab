import { randomString } from '../../../support/commands';

describe('Form builder multiple choice component', () => {
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

  it('adds single select multiple choice field, tests validations and checks renderer', () => {
    cy.contains('Multiple choice').click();
    cy.contains('Save').click();
    cy.contains('Provide a question title').should('exist');
    cy.contains('Provide at least 1 answer').should('exist');
    cy.get('#e2e-title-multiloc').type('Question title', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1', { force: true });
    cy.contains('Save').click();
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains('Question title').should('exist');
    cy.contains('Option 1').should('exist');
    cy.contains('Survey').should('exist');
    cy.get('#e2e-single-select-control').should('exist');
  });

  it('adds multiselect multiple choice field and checks renderer', () => {
    cy.contains('Multiple choice').click();
    cy.get('#e2e-title-multiloc').type('Question title 2', { force: true });
    cy.get('#e2e-option-input-0').type('Option 1 question 2', { force: true });
    cy.get('#e2e-multiselect-toggle').click();
    cy.contains('Save').click();
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains('Question title 2').should('exist');
    cy.contains('Option 1 question 2').should('exist');
    cy.get('#e2e-multiselect-control').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
