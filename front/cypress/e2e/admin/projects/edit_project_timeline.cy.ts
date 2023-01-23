import { randomString } from '../../../support/commands';

describe('Project timeline page', () => {
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  let projectId: string;
  let projectSlug: string;
  let firstPhaseId: string;
  const phaseOneTitle = randomString();
  const phaseTwoTitle = randomString();

  beforeEach(() => {
    cy.setAdminLoginCookie();
  });

  before(() => {
    cy.setAdminLoginCookie();
    cy.getAuthUser()
      .then((user) => {
        return cy.apiCreateProject({
          type: 'timeline',
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
          assigneeId: user.body.data.id,
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        return cy.apiCreatePhase(
          projectId,
          phaseOneTitle,
          '2018-03-01',
          '2025-01-01',
          'ideation',
          true,
          true,
          true
        );
      })
      .then((phase) => {
        firstPhaseId = phase.body.data.id;
        return cy.apiCreatePhase(
          projectId,
          phaseTwoTitle,
          '2025-01-02',
          '2025-01-25',
          'budgeting',
          true,
          true,
          true,
          'description',
          undefined,
          undefined,
          400
        );
      });
  });

  it('in-platform survey method is disabled when trying to switch method of existing phase', () => {
    // Navigate to the timeline page
    cy.visit(`/admin/projects/${projectId}/timeline`);
    cy.acceptCookies();

    // Check to see that the first phase is listed
    cy.get(`[data-testid="${`e2e-phase-${firstPhaseId}`}"]`).should('exist');

    // Go to phase edit page
    cy.get(`[data-cy="${`e2e-edit-phase-${firstPhaseId}`}"]`).click();

    // Check that warning is present
    cy.get('#e2e-participation-method-warning').should('exist');

    // Check that radio is disabled
    cy.get('#participationmethod-native_survey')
      .siblings()
      .first()
      .should('have.class', 'disabled');
  });

  it('shows a modal for user to confirm deleting a phase and then deletes the phase on confirmation', () => {
    // Navigate to the timeline page
    cy.visit(`/admin/projects/${projectId}/timeline`);
    cy.acceptCookies();

    // Check to see that the first phase is listed
    cy.get(`[data-testid="${`e2e-phase-${firstPhaseId}`}"]`).should('exist');

    // Click on the delete button of the first phase
    cy.get(`[data-cy="${`e2e-delete-phase-${firstPhaseId}`}"]`).click();

    // Check to see that the modal is shown
    cy.get('.e2e-modal-close-button').should('exist');

    // Confirm delete
    cy.get(`[data-cy="${`e2e-confirm-delete-phase-${firstPhaseId}`}"]`).click();

    // Check to see that the first phase is no longer listed
    cy.get(`[data-testid="${`e2e-phase-${firstPhaseId}`}"]`).should(
      'not.exist'
    );
  });
});
