import { randomString, apiRemoveProject } from '../support/commands';

describe('Project topics', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  let projectId: string;
  let projectSlug: string;

  beforeEach(() => {
    // create new project
    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published'
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
    });

    cy.setAdminLoginCookie();
  });

  describe('Topic manager', () => {
    it('Adding a custom topic in the topic manager makes it available in the project topic settings', () => {

      // check that our topic is not there initially
      cy.visit(`admin/projects/${projectId}/topics`);
      cy.get('#e2e-project-topic-multiselect')
        .click()
        .contains('Custom topic 1')
        .should('not.exist');

      // go to topic manager
      cy.visit('admin/settings/topics');

      // Add custom topic
      cy.get('#e2e-custom-topics').click();
      cy.get('#e2e-topic-name').type('Custom topic 1');
      cy.get('.e2e-submit-wrapper-button').click();

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/topics`);
      cy.get('#e2e-project-topic-multiselect').click().contains('Custom topic 1');
    });

    it('Removing a custom topic in the topic manager makes it unavailable in the project topic settings', () => {
      // check that our topic is there initially
      cy.visit(`admin/projects/${projectId}/topics`);
      cy.get('#e2e-project-topic-multiselect')
      .click()
      .contains('Custom topic 1');

      // go to topic manager
      cy.visit('admin/settings/topics');

      // Remove custom topic
      // todo

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/topics`);
      cy.get('#e2e-project-topic-multiselect')
        .click()
        .contains('Custom topic 1')
        .should('not.exist');
    });

    it('Renaming a custom topic in the topic manager updates its name in the project topic settings', () => {
    });

  });

  describe('Project settings', () => {
    it('Adding a topic to a project makes it available in the idea form', () => {
    });

    it('Removing a topic from a project makes it unavailable in the idea form', () => {
    });

    it('Adding a topic to a project makes it available in the project idea manager', () => {
    });

    it('Removing a topic from a project makes it unavailable in the project idea manager', () => {
    });

  });

  afterEach(() => {
    apiRemoveProject(projectId);
  });
});
