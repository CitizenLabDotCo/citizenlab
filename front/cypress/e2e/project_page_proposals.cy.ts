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

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});

describe('Proposals sorting by status', () => {
  const projectTitle = randomString();
  const proposedTitle = randomString();
  const ineligibleTitle = randomString();
  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.setAdminLoginCookie();

    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: 'Description preview',
      publicationStatus: 'published',
    })
      .then((project) => {
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
      })
      .then((phase) => {
        const phaseId = phase.body.data.id;

        return cy
          .apiCreateIdea({
            phaseId,
            ideaTitle: proposedTitle,
            ideaContent: 'Stays in the proposed status',
          })
          .then(() =>
            // Created last, so it is the newest: any date-based sort puts it first,
            // which proves the status sort is what moves it down.
            cy.apiCreateIdea({
              phaseId,
              ideaTitle: ineligibleTitle,
              ideaContent: 'Moved to the ineligible status',
            })
          )
          .then((idea) =>
            cy.apiSetIdeaStatus({
              ideaId: idea.body.data.id,
              statusCode: 'ineligible',
              participationMethod: 'proposals',
            })
          );
      });
  });

  beforeEach(() => {
    cy.visit(`/projects/${projectSlug}`);
    // Both cards present means the list has loaded, so the sort buttons are
    // mounted and a click on them is not swallowed.
    cy.get('#e2e-ideas-list').find('.e2e-idea-card').should('have.length', 2);
  });

  it('sorts the proposed status before the ineligible one', () => {
    // Newest first puts the ineligible proposal on top
    cy.get('#e2e-item-new').click();
    cy.location('search').should('contain', 'sort=new');
    cy.get('.e2e-idea-card').first().should('contain', ineligibleTitle);

    cy.get('#e2e-item-status_priority').click();
    cy.location('search').should('contain', 'sort=status_priority');
    cy.get('.e2e-idea-card').first().should('contain', proposedTitle);
    cy.get('.e2e-idea-card').last().should('contain', ineligibleTitle);
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });
});
