import { randomString, randomEmail } from '../../../support/commands';

const email = randomEmail();
const password = randomString();
const projectTitle = randomString();
const projectDescription = randomString(30);
const projectDescriptionPreview = randomString(30);
let projectId: string;
let userId: string;

describe('Admin project approval flow', () => {
  before(() => {
    cy.apiCreateProject({
      title: projectTitle,
      descriptionPreview: projectDescriptionPreview,
      description: projectDescription,
      publicationStatus: 'draft',
    }).then((project) => {
      projectId = project.body.data.id;
      cy.apiCreateModeratorForProject({
        firstName: 'John',
        lastName: 'Doe',
        email,
        password,
        projectId,
      }).then((moderator) => {
        userId = moderator.body.data.id;
      });
    });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('should be possible for a project moderator to request approval for a project', () => {
    cy.setLoginCookie(email, password);
    cy.visit(`admin/projects/${projectId}`);

    // PM opens the Schedule Launch modal via the entry button; the primary
    // action is "Request approval" which also saves the default schedule.
    cy.get('#e2e-publish').click();
    cy.get('#e2e-schedule-launch-submit').click();

    // After submit the modal closes and the entry button becomes the disabled
    // "Approval requested" state (but still opens the modal to view schedule).
    cy.get('#e2e-publish').should('exist').and('contain', 'Approval requested');
  });

  it('should be possible for an admin to approve a project', () => {
    cy.setLoginCookie('admin@govocal.com', 'democracy2.0');
    cy.visit(`admin/projects/${projectId}`);

    // Admin entry button reads "Approve & schedule". Clicking opens the modal
    // whose primary action approves the review and saves the schedule.
    cy.get('#e2e-publish').click();
    cy.get('#e2e-schedule-launch-submit').click();

    // Once approved + scheduled, entry button shows "Scheduled".
    cy.get('#e2e-publish').should('exist').and('contain', 'Scheduled');
  });

  it('should be possible for a project moderator to publish an approved project', () => {
    cy.setLoginCookie(email, password);
    cy.visit(`admin/projects/${projectId}`);

    // Open the modal, switch to "Now" mode, then publish now.
    cy.get('#e2e-publish').click();
    cy.dataCy('e2e-mode-toggle-now').click();
    cy.get('#e2e-schedule-launch-submit').click();

    // Once published, the entry button reflects the Published status.
    cy.get('#e2e-publish').should('exist').and('contain', 'Published');
  });
});
