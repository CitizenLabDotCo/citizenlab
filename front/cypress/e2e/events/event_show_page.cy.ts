import moment = require('moment');
import { randomEmail, randomString } from '../../support/commands';

describe('Event show page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const projectTitle = randomString();
  const projectDescriptionPreview = randomString(30);

  let projectId: string;
  let projectSlug: string;
  let eventIdNoCoordinates: string;
  let eventIdWithCoordinates: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password)
      .then(() => {
        cy.apiLogin(email, password);
      })
      .then(() => {
        return cy.apiCreateProject({
          title: projectTitle,
          descriptionPreview: projectDescriptionPreview,
          description: randomString(),
          publicationStatus: 'draft',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
        cy.apiCreatePhase({
          projectId,
          title: 'phaseTitle',
          startAt: moment().subtract(2, 'month').format('DD/MM/YYYY'),
          endAt: moment().add(2, 'days').format('DD/MM/YYYY'),
          participationMethod: 'ideation',
          canComment: true,
          canPost: true,
          canReact: true,
          allow_anonymous_participation: true,
        });
      })
      .then(() => {
        return cy.apiCreateEvent({
          projectId,
          title: 'Some event',
          location: 'Some location with no coordinates',
          includeLocation: false,
          description: 'This is some event',
          startDate: moment().subtract(1, 'day').toDate(),
          endDate: moment().add(1, 'day').toDate(),
          onlineLink: 'https://www.example.com',
        });
      })
      .then((event) => {
        eventIdNoCoordinates = event.body.data.id;
      })
      .then(() => {
        return cy.apiCreateEvent({
          projectId,
          title: 'Some event',
          location: 'Some location with coordinates',
          includeLocation: true,
          description: 'This is some event',
          startDate: new Date('2022-04-04'),
          endDate: new Date('2022-05-05'),
          onlineLink: 'https://www.example.com',
        });
      })
      .then((event) => {
        eventIdWithCoordinates = event.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('shows event information when authorized', () => {
    // Event in an admin-only project, when logged in as admin should show event details
    cy.setAdminLoginCookie();
    cy.visit(`/events/${eventIdNoCoordinates}`);
    cy.get('#e2e-not-authorized').should('not.exist');
    cy.get('#e2e-event-title').should('exist');
    cy.get('#e2e-event-date-stylized').should('exist');
    // cy.get('.e2e-event-attendance-button').should('exist');
    cy.get('#e2e-participants-count').should('not.exist');
    cy.get('#e2e-text-only-location').should('exist');
    cy.get('#e2e-location-with-coordinates-button').should('not.exist');
    cy.dataCy('e2e-event-description');

    // Click attend button
    cy.get('.e2e-event-attendance-button').click();
    // Confirm that the button now shows "attending"
    cy.get('.e2e-event-attendance-button').contains('Attending');
    // Confirm that participant count is now shown
    cy.get('#e2e-participants-count').should('exist');
  });

  it('shows map modal when location coordinates exist', () => {
    // Click location button
    cy.setAdminLoginCookie();
    cy.visit(`/events/${eventIdWithCoordinates}`);
    cy.get('#e2e-text-only-location').should('not.exist');
    cy.get('#e2e-location-with-coordinates-button').should('exist');
    cy.get('#e2e-location-map').should('exist');
  });

  it('shows unauthorized notice when applicable', () => {
    // Event in an admin-view-only project, when not logged in should show unauthorized notice
    cy.clearCookies();
    cy.visit(`/events/${eventIdNoCoordinates}`);
    cy.get('#e2e-not-authorized').should('exist');
    cy.get('#e2e-event-title').should('not.exist');
  });
});
