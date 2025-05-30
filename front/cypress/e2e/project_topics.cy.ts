import { randomString } from '../support/commands';
import moment = require('moment');

describe('Project topics', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString();
  const projectDescription = randomString();

  let projectId: string;
  let projectSlug: string;
  let phaseId: string;

  beforeEach(() => {
    // create new project
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
    })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase({
          projectId,
          title: 'firstPhaseTitle',
          startAt: moment().subtract(9, 'month').format('DD/MM/YYYY'),
          endAt: moment().subtract(3, 'month').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canPost: true,
          canComment: true,
          canReact: true,
        });
      })
      .then((phase) => {
        phaseId = phase.body.data.id;
      });

    cy.setAdminLoginCookie();
  });

  describe('Topic manager', () => {
    it('Adding a custom topic in the topic manager makes it available in the project topic settings', () => {
      const topicTitle = randomString();

      // go to topic manager
      cy.visit('admin/settings/topics');

      // Add custom topic
      cy.get('#e2e-add-custom-topic-button').click();
      cy.clickLocaleSwitcherAndType(topicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle);

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/settings/tags`);
      cy.get('#e2e-project-topic-multiselect').click().contains(topicTitle);
    });

    it('Removing a custom topic in the topic manager makes it unavailable in the project topic settings', () => {
      const topicTitle = randomString();

      // create a topic
      cy.visit('admin/settings/topics');
      cy.get('#e2e-add-custom-topic-button').click();
      cy.clickLocaleSwitcherAndType(topicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle);

      // and check that our topic is there initially
      cy.visit(`admin/projects/${projectId}/settings/tags`);
      cy.get('#e2e-project-topic-multiselect').click().contains(topicTitle);

      // go to topic manager
      cy.visit('admin/settings/topics');

      // Remove custom topic
      cy.get('.e2e-topic-field-row')
        .first()
        .find('#e2e-custom-topic-delete-button')
        .click();
      cy.get('#e2e-custom-topic-delete-confirmation-button').click();

      // Go to our project topic settings and check that topic is not available
      cy.visit(`admin/projects/${projectId}/settings/tags`);
      cy.get('#e2e-project-topic-multiselect')
        .click()
        .contains(topicTitle)
        .should('not.exist');
    });

    it('Renaming a custom topic in the topic manager updates its name in the project topic settings', () => {
      const topicTitle = randomString();
      const editedTopicTitle = randomString();

      // create a topic
      cy.visit('admin/settings/topics');
      cy.get('#e2e-add-custom-topic-button').click();
      cy.clickLocaleSwitcherAndType(topicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle);

      // and check that our topic is there initially
      cy.visit(`admin/projects/${projectId}/settings/tags`);
      cy.get('#e2e-project-topic-multiselect').click().contains(topicTitle);

      // go to topic manager
      cy.visit('admin/settings/topics');

      // Edit the name of the custom topic
      cy.get('.e2e-topic-field-row')
        .first()
        .find('#e2e-custom-topic-edit-button')
        .click();
      cy.get('#title_multiloc').clear().type(editedTopicTitle);
      cy.get('.nl-BE').click();
      cy.get('#title_multiloc').clear().type(editedTopicTitle);
      cy.get('.nl-NL').click();
      cy.get('#title_multiloc').clear().type(editedTopicTitle);
      cy.get('.fr-BE').click();
      cy.get('#title_multiloc').clear().type(editedTopicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(editedTopicTitle);

      // Go to our project topic settings and check that name has chang
      cy.visit(`admin/projects/${projectId}/settings/tags`);
      cy.get('#e2e-project-topic-multiselect')
        .click()
        .contains(editedTopicTitle);
    });
  });

  describe('Project topic settings', () => {
    const title = randomString(12);
    const description = randomString(42);

    it('Adding a topic to a project makes it available in the idea form', () => {
      const topicTitle = randomString();

      // create a topic
      cy.visit('admin/settings/topics');
      cy.get('#e2e-add-custom-topic-button').click();
      cy.clickLocaleSwitcherAndType(topicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle);

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/settings/tags`);

      // Add our new topic
      cy.get('#e2e-project-topic-multiselect').click();
      cy.get('#react-select-2-option-0').click();
      cy.get('#e2e-add-project-topic-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle);

      // Visit the project page and accept cookies. This is needed because the cookie banner is not interactive on the input form
      cy.visit(`/projects/${projectSlug}`);
      cy.acceptCookies();

      // Go to idea form for our project
      cy.visit(`projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

      // Fill in the title and description since these are required
      cy.get('#e2e-idea-title-input ').type(title, { delay: 0 });
      cy.get('#e2e-idea-title-input ').should('contain.value', title);

      cy.dataCy('e2e-next-page').should('be.visible').click();

      cy.get('#e2e-idea-description-input .ql-editor').type(description);
      cy.get('#e2e-idea-description-input .ql-editor').contains(description);

      // Go to the next page of the idea form
      cy.dataCy('e2e-next-page').should('be.visible').click();

      // Go to the page with topics
      cy.dataCy('e2e-next-page').should('be.visible').click();

      // Verify the topic is selectable in the topic selector
      cy.get('.e2e-topics-picker');
      cy.get('.e2e-topics-picker-item').contains(topicTitle);
    });

    it('Removing a topic from a project makes it unavailable in the idea form', () => {
      const topicTitle = randomString();

      // create a topic
      cy.visit('admin/settings/topics');
      cy.get('#e2e-add-custom-topic-button').click();
      cy.clickLocaleSwitcherAndType(topicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle);

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/settings/tags`);

      // Add our new topic to the project
      cy.get('#e2e-project-topic-multiselect').click();
      cy.get('#react-select-2-option-0').click();
      cy.get('#e2e-add-project-topic-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle);

      // Visit the project page and accept cookies. This is needed because the cookie banner is not interactive on the input form
      cy.visit(`/projects/${projectSlug}`);
      cy.acceptCookies();

      // Go to idea form for our project
      cy.visit(`projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

      // Fill in the title and description since these are required
      cy.get('#e2e-idea-title-input ').type(title, { delay: 0 });
      cy.get('#e2e-idea-title-input ').should('contain.value', title);

      cy.dataCy('e2e-next-page').should('be.visible').click();

      cy.get('#e2e-idea-description-input .ql-editor').type(description);
      cy.get('#e2e-idea-description-input .ql-editor').contains(description);

      cy.wait(500);

      // Go to the next page of the idea form
      cy.dataCy('e2e-next-page').should('be.visible').click();

      // Go to the page with topics (Page 3 for now)
      cy.dataCy('e2e-next-page').should('be.visible').click();

      // Verify the topic is selectable in the topic selector
      cy.get('.e2e-topics-picker');
      cy.get('.e2e-topics-picker-item').contains(topicTitle);

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/settings/tags`);

      // Remove our new topic from the project
      cy.get('.e2e-admin-list-row');
      cy.get('.e2e-admin-list-row')
        .first()
        .find('#e2e-project-topic-delete-button')
        .click();
      // Confirm in the modal
      cy.get('#e2e-project-topic-delete-confirm-button').click();
      cy.wait(1000);
      cy.get('.e2e-admin-list-row').contains(topicTitle).should('not.exist');

      // Go to idea form for our project
      cy.visit(`projects/${projectSlug}/ideas/new?phase_id=${phaseId}`);

      cy.get('#e2e-idea-title-input ').type(title, { delay: 0 });
      cy.get('#e2e-idea-title-input ').should('contain.value', title);

      cy.dataCy('e2e-next-page').should('be.visible').click();

      cy.get('#e2e-idea-description-input .ql-editor').type(description);
      cy.get('#e2e-idea-description-input .ql-editor').contains(description);

      cy.wait(500);

      // Go to the next page of the idea form
      cy.dataCy('e2e-next-page').should('be.visible').click();

      // Go to the page with topics
      cy.dataCy('e2e-next-page').should('be.visible').click();

      // Verify the topic is not available in the topic selector
      cy.get('.e2e-topics-picker');
      cy.get('.e2e-topics-picker-item')
        .contains(topicTitle)
        .should('not.exist');
    });

    it('Adding a topic to a project makes it available in the project idea manager', () => {
      const topicTitle = randomString();

      // create a topic in the topic manager
      cy.visit('admin/settings/topics');
      cy.get('#e2e-add-custom-topic-button').click();
      cy.clickLocaleSwitcherAndType(topicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/settings/tags`);

      // Add our new topic to the project
      cy.get('#e2e-project-topic-multiselect').click();
      cy.get('#react-select-2-option-0').click();
      cy.get('#e2e-add-project-topic-button').click();
      cy.wait(1000);

      // Go to idea manager for our project
      cy.visit(`admin/projects/${projectId}/phases/${phaseId}/ideas`);

      // Open topics tab
      cy.get('#topics').click();
      cy.wait(1000);

      // Find our newly added topic in the filters
      cy.get('#e2e-idea-manager-topic-filters').contains(topicTitle);
    });

    it('Removing a topic from a project makes it unavailable in the project idea manager', () => {
      const topicTitle = randomString();

      // create a topic in the topic manager
      cy.visit('admin/settings/topics');
      cy.get('#e2e-add-custom-topic-button').click();
      cy.clickLocaleSwitcherAndType(topicTitle);
      cy.get('#e2e-submit-wrapper-button').click();
      cy.wait(1000);

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/settings/tags`);

      // Add our new topic
      cy.get('#e2e-project-topic-multiselect').click();
      cy.get('#react-select-2-option-0').click();
      cy.get('#e2e-add-project-topic-button').click();
      cy.wait(1000);

      // Go to idea manager for our project
      cy.visit(`admin/projects/${projectId}/phases/${phaseId}/ideas`);

      // Open topics tab
      cy.get('#topics').click();
      cy.wait(1000);

      // Find our newly added topic in the filters
      cy.get('#e2e-idea-manager-topic-filters').contains(topicTitle);

      // Go to our project topic settings
      cy.visit(`admin/projects/${projectId}/settings/tags`);

      // Remove our new topic from the project
      cy.get('.e2e-admin-list-row')
        .first()
        .find('#e2e-project-topic-delete-button')
        .click();

      // Confirm in modal
      cy.get('#e2e-project-topic-delete-confirm-button').click();
      cy.wait(1000);

      // Go to idea manager for our project
      cy.visit(`admin/projects/${projectId}/phases/${phaseId}/ideas`);

      // Open topics tab
      cy.get('#topics').click();
      cy.wait(1000);

      // Verify the topic is not selectable in the idea manager topics tab
      cy.get('#e2e-idea-manager-topic-filters')
        .contains(topicTitle)
        .should('not.exist');
    });
  });

  afterEach(() => {
    cy.apiRemoveProject(projectId);
  });
});
