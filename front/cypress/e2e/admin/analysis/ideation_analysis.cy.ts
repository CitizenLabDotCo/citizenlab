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

  it('previews input correctly', () => {
    cy.get('[data-cy="e2e-analysis-input-preview"]').should(
      'contain',
      'My first idea'
    );
    cy.get('[data-cy="e2e-analysis-input-item"]').last().click();
    cy.get('[data-cy="e2e-analysis-input-preview"]').should(
      'contain',
      'My third idea'
    );
  });

  it('works with manual tags', () => {
    // Has two tags by default e2e-analysis-tag
    cy.get('[data-cy="e2e-analysis-tag-container"]').should('have.length', 2);

    // Add a tag e2e-analysis-add-tag-input
    cy.get('#e2e-analysis-add-tag-input').type('My new tag');
    cy.get('#e2e-analysis-add-tag-button').click();
    cy.get('[data-cy="e2e-analysis-tag-container"]').should('have.length', 3);

    // Adds a tagging to input
    cy.get('[data-cy="e2e-analysis-input-item"]').first().click();
    cy.get('[data-cy="e2e-analysis-input-preview"]')
      .find('[data-cy="e2e-analysis-tag"]')
      .contains('My new tag')
      .click();
    cy.get('[data-cy="e2e-analysis-input-item"]')
      .first()
      .should('contain', 'My new tag');

    // Filters input on tag selection
    cy.get('[data-cy="e2e-analysis-tag"]').contains('My new tag').click();
    cy.get('[data-cy="e2e-analysis-input-item"]').should('have.length', 1);

    // Filters on input without tags
    cy.get('[data-cy="e2e-analysis-inputs-without-tags"]').click();
    cy.get('[data-cy="e2e-analysis-input-item"]').should('have.length', 2);

    // All input
    cy.get('[data-cy="e2e-analysis-all-tags"]').click();
    cy.get('[data-cy="e2e-analysis-input-item"]').should('have.length', 3);

    // Delete a tag
    cy.get('[data-cy="e2e-analysis-tag-action"]').first().click();
    cy.get('#e2e-analysis-delete-tag-button').click();
    cy.on('window:confirm', () => true);
    cy.get('[data-cy="e2e-analysis-tag-container"]').should('have.length', 2);
    cy.get('[data-cy="e2e-analysis-input-preview"]').should(
      'not.contain',
      'My new tag'
    );
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
