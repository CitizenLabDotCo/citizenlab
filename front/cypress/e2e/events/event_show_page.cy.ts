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
  let eventId: string;

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
          publicationStatus: 'draft',
        });
      })
      .then((project) => {
        projectId = project.body.data.id;
        projectSlug = project.body.data.attributes.slug;
      })
      .then(() => {
        return cy.apiCreateEvent({
          projectId,
          title: 'Some event',
          location: 'Some location',
          description: 'This is some event',
          startDate: new Date('2022-04-04'),
          endDate: new Date('2022-05-05'),
        });
      })
      .then((event) => {
        eventId = event.body.data.id;
      });
  });

  after(() => {
    cy.apiRemoveProject(projectId);
  });

  it('shows event information when authorized', () => {
    // Event in an admin-only project, when logged in as admin should show event details
    cy.setAdminLoginCookie();
    cy.visit(`/events/${eventId}`);
    cy.get('#e2e-not-authorized').should('not.exist');
    cy.get('#e2e-event-title').should('exist');
  });

  it('shows unauthorized notice when applicable', () => {
    // Event in an admin-view-only project, when not logged in should show unauthorized notice
    cy.clearCookies();
    cy.visit(`/events/${eventId}`);
    cy.get('#e2e-not-authorized').should('exist');
    cy.get('#e2e-event-title').should('not.exist');
  });
});
