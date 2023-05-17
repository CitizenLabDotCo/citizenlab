import { randomString } from '../support/commands';

describe('Idea posting anonymous', () => {
  before(() => {
    const projectTitle = randomString();
    const projectDescriptionPreview = randomString();
    const projectDescription = randomString();

    cy.apiCreateProject({
      type: 'continuous',
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'published',
      participationMethod: 'ideation',
    });

    // cy.apiSignup()

    cy.visit(`/projects/${projectTitle}`);
  });
});
