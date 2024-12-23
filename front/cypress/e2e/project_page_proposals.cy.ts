import { randomString } from '../support/commands';

describe('New timeline project with proposals phase', () => {
  const projectTitle = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.setAdminLoginCookie();

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: 'Description preview',
      description: 'Description full',
      publicationStatus: 'published',
    }).then((project) => {
      projectId = project.body.data.id;
      projectSlug = project.body.data.attributes.slug;
      return cy.apiCreatePhase({
        projectId,
        title: 'phaseTitle',
        startAt: '2018-03-01',
        endAt: '2025-01-01',
        participationMethod: 'proposals',
        presentation_mode: 'card',
        canComment: true,
        canPost: true,
        canReact: true,
      });
    });
  });

  it('shows the correct proposals statuses in the filters', () => {
    // Visit proposals project
    cy.visit(`/projects/${projectSlug}`);
    // Confirm that the proposal statuses are shown
    cy.contains('Proposed').should('exist');
    cy.contains('Threshold reached').should('exist');
    cy.contains('Ineligible').should('exist');
  });
});
