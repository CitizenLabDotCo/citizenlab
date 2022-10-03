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

  it('adds multiple choice field and tests validations', () => {
    cy.contains('Multiple choice').click();
    cy.contains('Save').click();
    cy.contains('Provide a question title').should('exist');
    cy.contains('Provide at least 1 answer').should('exist');
    cy.get('#e2e-title-multiloc').type('Question title', { force: true });
    cy.get('#e2e-option-input').type('Option 1', { force: true });
    cy.contains('Save').click();
  });

  it('checks that single select renderer used in front office', () => {
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains('Question title').should('exist');
    cy.contains('Option 1').should('exist');
    cy.get('#e2e-single-select-control').should('exist');
  });

  it('changes multiple choice field to multiselect', () => {
    cy.visit(`admin/projects/${projectId}/native-survey/edit`);
    cy.contains('Edit').click();
    cy.get('#e2e-multiselect-toggle').click();
    cy.contains('Save').click();
  });

  it('checks that multiselect renderer used in front office', () => {
    cy.visit(`/projects/${projectSlug}/ideas/new`);
    cy.contains('Question title').should('exist');
    cy.contains('Option 1').should('exist');
    cy.get('#e2e-multiselect-control').should('exist');
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
