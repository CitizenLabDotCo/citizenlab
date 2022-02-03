import { randomString } from '../support/commands';

describe.skip('Project and folder cards on front page', () => {
  const publishedProjectTitle = randomString();
  const publishedProjectDescriptionPreview = randomString(30);
  let publishedProjectId: string;

  const archivedProjectTitle = randomString();
  const archivedProjectDescriptionPreview = randomString(30);
  let archivedProjectId: string;

  before(() => {
    cy.apiCreateProject({
      type: 'continuous',
      title: publishedProjectTitle,
      descriptionPreview: publishedProjectDescriptionPreview,
      description: randomString(),
      publicationStatus: 'published',
    }).then((project) => {
      publishedProjectId = project.body.data.id;

      cy.apiCreateProject({
        type: 'continuous',
        title: archivedProjectTitle,
        descriptionPreview: archivedProjectDescriptionPreview,
        description: randomString(),
        publicationStatus: 'archived',
      }).then((project) => {
        archivedProjectId = project.body.data.id;

        cy.goToLandingPage();
      });
    });
  });

  it('shows published project but not archived project if tab === Active', () => {
    cy.get('.e2e-project-card').first().contains(publishedProjectTitle);

    cy.get('#e2e-projects-container').should(
      'contain.text',
      publishedProjectTitle
    );

    cy.get('#e2e-projects-container').should(
      'not.contain.text',
      archivedProjectTitle
    );
  });

  it('shows archived project but not published project if tab === Archived', () => {
    cy.get('#project-cards-tab-archived').click();

    cy.get('.e2e-project-card').first().contains(archivedProjectTitle);

    cy.get('#e2e-projects-container').should(
      'not.contain.text',
      publishedProjectTitle
    );

    cy.get('#e2e-projects-container').should(
      'contain.text',
      archivedProjectTitle
    );
  });

  it('shows both published and archived project if tab === All', () => {
    cy.get('#project-cards-tab-all').click();

    cy.get('#e2e-projects-container').should(
      'contain.text',
      publishedProjectTitle
    );

    cy.get('#e2e-projects-container').should(
      'contain.text',
      archivedProjectTitle
    );
  });

  after(() => {
    cy.apiRemoveProject(publishedProjectId);
    cy.apiRemoveProject(archivedProjectId);
  });
});
