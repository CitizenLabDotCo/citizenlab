import { randomString } from '../../../support/commands';

describe('Admin: schedule project launch', () => {
  const projectTitle = randomString();
  const projectDescription = randomString(30);
  const projectDescriptionPreview = randomString(30);
  let projectId: string;

  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
    });
  });

  beforeEach(() => {
    cy.setAdminLoginCookie();
    cy.visit(`/admin/projects/${projectId}`);
  });

  after(() => {
    if (projectId) cy.apiRemoveProject(projectId);
  });

  it('schedules a draft project, then cancels the schedule', () => {
    // Draft project → entry button says "Publish"
    cy.get('#e2e-publish').should('contain', 'Publish');

    // Open the Schedule Launch modal
    cy.get('#e2e-publish').click();

    // Default state opens on the "Schedule" tab with a pre-filled
    // future date/time. Submitting saves the schedule.
    cy.dataCy('e2e-mode-toggle-schedule').should('exist');
    cy.get('#e2e-schedule-launch-submit').click();

    // Modal closes and the entry button now reflects the scheduled state.
    cy.get('#e2e-publish').should('contain', 'Scheduled');

    // Re-open the modal to cancel the schedule.
    cy.get('#e2e-publish').click();

    // Cancel schedule is only shown when a schedule exists.
    cy.contains('Cancel schedule').should('be.visible').click();

    // Back to an unscheduled draft → entry button reverts to "Publish".
    cy.get('#e2e-publish').should('contain', 'Publish');
  });

  it('publishes now from the schedule launch modal', () => {
    cy.get('#e2e-publish').click();

    // Switch to "Now" mode and submit.
    cy.dataCy('e2e-mode-toggle-now').click();
    cy.get('#e2e-schedule-launch-submit').click();

    // Project is immediately published.
    cy.get('#e2e-publish').should('contain', 'Published');
  });
});
