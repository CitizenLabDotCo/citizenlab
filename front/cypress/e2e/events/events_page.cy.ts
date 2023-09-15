import moment = require('moment');
import { randomEmail, randomString } from '../../support/commands';

describe('All events page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);
  const emailTitle = randomString();

  let projectId: string;
  let projectSlug: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        return cy.apiCreateProject({
          type: 'continuous',
          title: projectTitle,
          participationMethod: 'ideation',
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'published',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
      })
      .then(() => {
        return cy.apiCreateEvent({
          projectId,
          title: emailTitle,
          location: 'Some location with no coordinates',
          includeLocation: false,
          description: 'This is some event',
          startDate: moment().subtract(1, 'day').toDate(),
          endDate: moment().add(1, 'day').toDate(),
        });
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('shows event information when authorized', () => {
    // Event in an admin-only project, when logged in as admin should show event details
    cy.setAdminLoginCookie();
    cy.visit(`/events`);

    // Select filters
    cy.get('#e2e-project-filter-selector').should('exist');
    cy.get('#e2e-project-filter-selector').click();
    cy.get('#e2e-project-filter-selector').should('contain', projectTitle);
    cy.contains(projectTitle).click({ force: true });

    cy.get('#e2e-event-date-filter').should('exist');
    cy.get('#e2e-event-date-filter').click();
    cy.contains('Today').should('exist');
    cy.contains('Today').click();

    // Confirm filters added to URL
    cy.url().should('contain', `ongoing_events_project_ids`);
    cy.url().should('contain', `${projectId}`);
    cy.url().should('contain', `time_period`);
    cy.url().should('contain', `today`);

    // Confirm filters work
    cy.get('#e2e-current-and-upcoming-events').within(() => {
      cy.get('#e2e-event-card').should('exist');
      cy.contains(emailTitle).should('exist');
    });

    // Go to event page
    cy.contains(emailTitle).click();

    // Go back to all events page using the back button
    cy.get('#e2e-go-back-link').should('exist');
    cy.get('#e2e-go-back-link').click();

    // Confirm the filters are still applied
    cy.url().should('contain', `ongoing_events_project_ids`);
    cy.url().should('contain', `${projectId}`);
    cy.url().should('contain', `time_period`);
    cy.url().should('contain', `today`);
  });
});
