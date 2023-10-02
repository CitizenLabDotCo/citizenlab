import { randomString } from '../../../support/commands';

let projectId = '';
describe('Admin: ideation analysis', () => {
  beforeEach(() => {
    cy.setAdminLoginCookie();
  });
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
    }).then((project) => {
      projectId = project?.body.data.id;
      const ideaTitle1 = 'My first idea';
      const ideaTitle2 = 'My second idea';
      const ideaTitle3 = 'My third idea';

      const ideaContent = randomString();
      cy.apiCreateIdea(project?.body.data.id, ideaTitle1, ideaContent);
      cy.apiCreateIdea(project?.body.data.id, ideaTitle2, ideaContent);
      cy.apiCreateIdea(project?.body.data.id, ideaTitle3, ideaContent);
    });
  });

  it('creates an analysis from an ideation entry point', () => {
    cy.visit('/admin/projects/' + projectId + '/ideas');
    cy.get('#e2e-analysis-banner-button').click();

    // Consent modal
    cy.get('#e2e-analysis-consent-checkbox').click();
    cy.get('#e2e-analysis-consent-button').click();

    cy.location('pathname').should(
      'include',
      '/en/admin/projects/' + projectId + '/analysis'
    );

    // Launch modal
    cy.get('#e2e-analysis-launch-modal').should('exist');
    cy.get('#e2e-analysis-launch-modal-agree-button').click();
  });

  it('searches inputs correctly', () => {
    cy.get('[data-cy="e2e-analysis-input-item"]').should('have.length', 3);
    cy.get('#search-input').type('first');
    cy.get('[data-cy="e2e-analysis-input-item"]').should('have.length', 1);
    cy.get('#search-input').clear();
    cy.get('[data-cy="e2e-analysis-input-item"]').should('have.length', 3);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
