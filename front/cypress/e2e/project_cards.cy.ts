import { randomString } from '../support/commands';

describe('Project and folder cards on front page', () => {
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

describe('Native survey project card', () => {
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
    cy.visit(`/`);
  });

  it('Correct CTA button on card is shown', () => {
    cy.contains('Take the survey').should('exist');
    cy.contains('Take the survey').click({ force: true });
    cy.url().should('include', `/projects/${projectSlug}`);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
